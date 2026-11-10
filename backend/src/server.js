import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import { randomUUID, timingSafeEqual } from 'node:crypto';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 8787);
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
  max: 8,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
}) : null;

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500').split(',').map(x => x.trim());
app.use(cors({ origin(origin, cb) { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); return cb(new Error('Origin not allowed')); }, methods: ['GET','POST','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','X-Request-Id'] }));
app.use(express.json({ limit: '64kb', strict: true }));
app.use(rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: 'draft-7', legacyHeaders: false }));

app.use((req,res,next) => { req.requestId = req.get('X-Request-Id')?.slice(0,80) || randomUUID(); res.setHeader('X-Request-Id',req.requestId); next(); });
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const dbRequired = (req,res,next) => { if (!pool) return res.status(503).json({ error:'database_not_configured', message:'Backend database is not configured.' }); next(); };
const safeEqual = (a,b) => { const x=Buffer.from(a||''); const y=Buffer.from(b||''); return x.length===y.length && x.length>0 && timingSafeEqual(x,y); };
function ownerOnly(req,res,next) {
  const expected=process.env.NOVA_OWNER_TOKEN;
  const supplied=(req.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  if (!expected || expected.length < 32) return res.status(503).json({error:'admin_auth_not_configured'});
  if (!safeEqual(supplied,expected)) return res.status(401).json({error:'unauthorized'});
  req.actor='owner'; next();
}
const audit = async (client,eventType,targetType,targetId,details,req) => {
  await client.query('INSERT INTO audit_events(actor_type,actor_id,event_type,target_type,target_id,details,request_id) VALUES($1,$2,$3,$4,$5,$6,$7)', ['owner','env-owner',eventType,targetType,targetId,JSON.stringify(details||{}),req.requestId]);
};

app.get('/api/health', (req,res) => res.json({service:'nova-market-api',status:'ok',databaseConfigured:Boolean(pool),checkoutEnabled:false,version:'0.1.0'}));

app.get('/api/languages', dbRequired, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT language_tag,language_name,support_status,is_enabled,is_rtl FROM language_registry WHERE is_enabled=true ORDER BY language_tag');
  res.json({languages:rows});
}));

app.get('/api/products', dbRequired, asyncRoute(async(req,res)=>{
  const language=(req.query.lang||'en').toString().slice(0,35);
  const {rows}=await pool.query(`
    SELECT p.id,p.slug,p.category_code,p.public_price,p.public_currency,p.image_url,
      COALESCE(t.title,p.source_title) AS title,
      COALESCE(t.description,p.source_description) AS description,
      p.published_at
    FROM products p
    LEFT JOIN LATERAL (
      SELECT title,description FROM product_translations
      WHERE product_id=p.id AND language_tag=$1 AND review_status='reviewed'
      ORDER BY version DESC LIMIT 1
    ) t ON true
    WHERE p.status='published' AND p.compliance_status='passed'
    ORDER BY p.published_at DESC LIMIT 100`,[language]);
  res.json({products:rows});
}));

// Person-to-person marketplace: public responses expose published listings only.
// Seller contact fields and private attributes are intentionally excluded.
app.get('/api/marketplace/listings', dbRequired, asyncRoute(async(req,res)=>{
  const allowedCategories=['real-estate','used-cars','cars','auto-parts','motorcycles-scooters'];
  const category=typeof req.query.category==='string' && allowedCategories.includes(req.query.category)?req.query.category:null;
  const wilaya=typeof req.query.wilaya==='string'?req.query.wilaya.trim().slice(0,80):'';
  const municipality=typeof req.query.municipality==='string'?req.query.municipality.trim().slice(0,100):'';
  const search=typeof req.query.q==='string'?req.query.q.trim().slice(0,100):'';
  const limit=Math.min(40,Math.max(1,Number.parseInt(req.query.limit,10)||20));
  const offset=Math.max(0,Math.min(10000,Number.parseInt(req.query.offset,10)||0));
  const params=[]; const where=["l.status='published'"];
  if(category){params.push(category);where.push('l.category_code=$'+params.length);}
  if(wilaya){params.push(wilaya);where.push('l.wilaya_name ILIKE $'+params.length);}
  if(municipality){params.push(municipality);where.push('l.municipality ILIKE $'+params.length);}
  if(search){params.push('%'+search+'%');where.push('(l.title ILIKE 
  params.push(limit,offset);
  const sql = "SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,"+
    "l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,"+
    "l.published_at,COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order) FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images "+
    "FROM marketplace_listings l LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id WHERE "+where.join(' AND ')+
    " GROUP BY l.id ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC LIMIT $"+(params.length-1)+" OFFSET $"+params.length;
  const {rows}=await pool.query(sql,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query("SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,l.created_at,l.updated_at FROM marketplace_listings l JOIN marketplace_sellers s ON s.id=l.seller_id WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100",[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{')+'%');where.push('(l.title ILIKE 
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
+params.length+" ESCAPE '\\\\' OR l.description ILIKE $"+params.length+" ESCAPE '\\\\')");}
  params.push(limit,offset);
  const {rows}=await pool.query(`
    SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,
      l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,
      l.published_at,
      COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order)
        FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images
    FROM marketplace_listings l
    LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id
    WHERE ${where.join(' AND ')}
    GROUP BY l.id
    ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC
    LIMIT ${params.length-1} OFFSET ${params.length}`,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query(`
    SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,
      l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,
      l.created_at,l.updated_at
    FROM marketplace_listings l
    JOIN marketplace_sellers s ON s.id=l.seller_id
    WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100`,[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)
    return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
+params.length+' OR l.description ILIKE 
  params.push(limit,offset);
  const sql = "SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,"+
    "l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,"+
    "l.published_at,COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order) FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images "+
    "FROM marketplace_listings l LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id WHERE "+where.join(' AND ')+
    " GROUP BY l.id ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC LIMIT $"+(params.length-1)+" OFFSET $"+params.length;
  const {rows}=await pool.query(sql,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query("SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,l.created_at,l.updated_at FROM marketplace_listings l JOIN marketplace_sellers s ON s.id=l.seller_id WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100",[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{')+'%');where.push('(l.title ILIKE 
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
+params.length+" ESCAPE '\\\\' OR l.description ILIKE $"+params.length+" ESCAPE '\\\\')");}
  params.push(limit,offset);
  const {rows}=await pool.query(`
    SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,
      l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,
      l.published_at,
      COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order)
        FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images
    FROM marketplace_listings l
    LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id
    WHERE ${where.join(' AND ')}
    GROUP BY l.id
    ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC
    LIMIT ${params.length-1} OFFSET ${params.length}`,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query(`
    SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,
      l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,
      l.created_at,l.updated_at
    FROM marketplace_listings l
    JOIN marketplace_sellers s ON s.id=l.seller_id
    WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100`,[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)
    return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
+params.length+')');}
  params.push(limit,offset);
  const sql = "SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,"+
    "l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,"+
    "l.published_at,COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order) FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images "+
    "FROM marketplace_listings l LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id WHERE "+where.join(' AND ')+
    " GROUP BY l.id ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC LIMIT $"+(params.length-1)+" OFFSET $"+params.length;
  const {rows}=await pool.query(sql,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query("SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,l.created_at,l.updated_at FROM marketplace_listings l JOIN marketplace_sellers s ON s.id=l.seller_id WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100",[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{')+'%');where.push('(l.title ILIKE 
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
+params.length+" ESCAPE '\\\\' OR l.description ILIKE $"+params.length+" ESCAPE '\\\\')");}
  params.push(limit,offset);
  const {rows}=await pool.query(`
    SELECT l.id,l.category_code,l.title,l.description,l.price_amount,l.price_currency,
      l.wilaya_name,l.municipality,l.attributes - ARRAY['phone','email','contact','seller_contact','documents','identity_document']::text[] AS attributes,
      l.published_at,
      COALESCE(jsonb_agg(jsonb_build_object('url',i.image_url,'order',i.sort_order) ORDER BY i.sort_order)
        FILTER (WHERE i.id IS NOT NULL),'[]'::jsonb) AS images
    FROM marketplace_listings l
    LEFT JOIN marketplace_listing_images i ON i.listing_id=l.id
    WHERE ${where.join(' AND ')}
    GROUP BY l.id
    ORDER BY l.published_at DESC NULLS LAST,l.created_at DESC
    LIMIT ${params.length-1} OFFSET ${params.length}`,params);
  res.json({listings:rows,limit,offset});
}));

app.get('/api/admin/marketplace/listings', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['pending_review','approved','rejected','published','removed'].includes(req.query.status)?req.query.status:'pending_review';
  const {rows}=await pool.query(`
    SELECT l.id,l.seller_id,s.display_name,l.category_code,l.title,l.description,l.price_amount,
      l.price_currency,l.wilaya_name,l.municipality,l.attributes,l.status,l.moderation_note,
      l.created_at,l.updated_at
    FROM marketplace_listings l
    JOIN marketplace_sellers s ON s.id=l.seller_id
    WHERE l.status=$1 ORDER BY l.created_at ASC LIMIT 100`,[status]);
  res.json({listings:rows});
}));

app.post('/api/admin/marketplace/listings/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)
    return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const listing=await client.query('SELECT id,status FROM marketplace_listings WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!listing.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'listing_not_found'});}
    if(listing.rows[0].status!=='pending_review'){await client.query('ROLLBACK');return res.status(409).json({error:'listing_not_pending_review'});}
    await client.query('UPDATE marketplace_listings SET status=$1,moderation_note=$2,reviewed_at=now(),updated_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'marketplace_listing.'+decision,'marketplace_listing',req.params.id,{note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,published:false,message:'Moderation decision recorded. Approval does not publish the listing automatically.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const status=['draft','needs_review','approved','published','paused','rejected','archived'].includes(req.query.status)?req.query.status:null;
  const params=[]; let where='';
  if(status){params.push(status);where='WHERE p.status=$1';}
  const {rows}=await pool.query(`SELECT p.id,p.slug,p.category_code,p.source_language,p.source_title,p.source_description,p.status,p.public_price,p.public_currency,p.compliance_status,p.created_at,s.display_name AS supplier FROM products p LEFT JOIN supplier_offers o ON o.product_id=p.id LEFT JOIN suppliers s ON s.id=o.supplier_id ${where} ORDER BY p.created_at DESC LIMIT 200`,params);
  res.json({products:rows});
}));

app.post('/api/admin/products', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {slug,category_code,source_language='en',title,description,public_price=null,public_currency=null}=req.body||{};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'') || !/^[a-z0-9_-]{2,60}$/i.test(category_code||'') || typeof title!=='string' || title.trim().length<3 || title.length>180 || typeof description!=='string' || description.trim().length<10 || description.length>10000) return res.status(400).json({error:'invalid_product'});
  if((public_price===null)!==(public_currency===null) || (public_price!==null && (!Number.isFinite(Number(public_price))||Number(public_price)<0||!/^[A-Z]{3}$/.test(public_currency)))) return res.status(400).json({error:'invalid_price'});
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const {rows}=await client.query(`INSERT INTO products(slug,category_code,source_language,source_title,source_description,status,public_price,public_currency) VALUES($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id,slug,status,created_at`,[slug,category_code,source_language,title.trim(),description.trim(),public_price,public_currency]);
    await audit(client,'product.draft_created','product',rows[0].id,{slug},req); await client.query('COMMIT');
    res.status(201).json({product:rows[0],message:'Saved as draft. Publication requires compliance checks and explicit approval.'});
  } catch(e){await client.query('ROLLBACK');if(e.code==='23505')return res.status(409).json({error:'slug_already_exists'});throw e;} finally{client.release();}
}));

app.post('/api/admin/products/:id/request-publication', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const client=await pool.connect();
  try { await client.query('BEGIN');
    const p=await client.query('SELECT id,status,compliance_status FROM products WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'product_not_found'});}
    if(p.rows[0].compliance_status!=='passed'){await client.query('ROLLBACK');return res.status(409).json({error:'compliance_not_passed',message:'Product cannot be published before documented compliance review.'});}
    const approval=await client.query(`INSERT INTO approvals(action_type,target_type,target_id,requested_by,requested_payload) VALUES('publish_product','product',$1,'owner',$2) RETURNING id,status,created_at`,[req.params.id,JSON.stringify({requestedFrom:'admin_api'})]);
    await client.query("UPDATE products SET status='needs_review',updated_at=now() WHERE id=$1",[req.params.id]);
    await audit(client,'product.publication_requested','product',req.params.id,{approvalId:approval.rows[0].id},req);
    await client.query('COMMIT');res.status(202).json({approval:approval.rows[0],message:'Publication request queued; no automatic publication.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/approvals', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT id,action_type,target_type,target_id,requested_payload,status,created_at FROM approvals WHERE status=\'pending\' ORDER BY created_at ASC LIMIT 100');
  res.json({approvals:rows});
}));

app.post('/api/admin/approvals/:id/decision', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {decision,note=''}=req.body||{};
  if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>1000)return res.status(400).json({error:'invalid_decision'});
  const client=await pool.connect();
  try {await client.query('BEGIN');
    const a=await client.query('SELECT * FROM approvals WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!a.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'approval_not_found'});}
    if(a.rows[0].status!=='pending'){await client.query('ROLLBACK');return res.status(409).json({error:'approval_already_decided'});}
    await client.query('UPDATE approvals SET status=$1,decision_note=$2,decided_at=now() WHERE id=$3',[decision,note,req.params.id]);
    await audit(client,'approval.'+decision,a.rows[0].target_type,a.rows[0].target_id,{approvalId:req.params.id,note},req);
    await client.query('COMMIT');
    res.json({id:req.params.id,status:decision,executed:false,message:'Decision recorded. This prototype does not execute publication or financial actions.'});
  } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}));

app.get('/api/admin/suppliers', dbRequired, ownerOnly, asyncRoute(async(req,res)=>{
  const {rows}=await pool.query('SELECT code,display_name,integration_status,notes,updated_at FROM suppliers ORDER BY code');
  res.json({suppliers:rows});
}));

app.post('/api/checkout', (req,res)=>res.status(503).json({error:'checkout_disabled',message:'Checkout is disabled until legal seller verification, payment approval, shipping rules, supplier integration and production security testing are complete.'}));

app.use((err,req,res,next)=>{const status=err.status||500; if(status>=500)console.error({requestId:req.requestId,error:err.message});res.status(status).json({error:status>=500?'internal_error':err.message,requestId:req.requestId});});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`NOVA API listening on :${port}`));
export { app, pool };
