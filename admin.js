import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const SUPABASE_URL = 'https://jjymmdnqawzgxihawpnh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jm2qpSeEIAQznhLo4iWzmg_uj3IveX6';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function status(element, message, ok = false) {
  element.textContent = message;
  element.className = ok ? 'admin-status admin-success' : 'admin-status admin-error';
}

async function apiCall(action, extra = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('لم نعثر على جلسة دخول. افتح صفحة إعداد المالك وسجّل الدخول أولاً.');
  const { data, error } = await supabase.functions.invoke('nova-admin-api', {
    body: { action, ...extra }
  });
  if (error) {
    let message = error.message || 'تعذر الاتصال بالخادم.';
    try {
      const body = await error.context?.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

async function cjCall(action, extra = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('يلزم تسجيل دخول المالك أولاً.');
  const { data, error } = await supabase.functions.invoke('cj-bridge', { body: { action, ...extra } });
  if (error) {
    let message = error.message || 'تعذر الاتصال بخدمة CJ.';
    try { const body = await error.context?.json(); if (body?.error) message = body.error; } catch {}
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

async function loadCJStatus() {
  try {
    const result = await cjCall('status');
    const supplier = result.supplier || {};
    const state = result.apiKeyConfigured ? 'مفتاح CJ محفوظ في الخادم' : 'بانتظار إضافة CJ_API_KEY إلى أسرار Supabase';
    $('cjStatus').textContent = (supplier.display_name || 'CJdropshipping') + ' · ' + (supplier.integration_status || 'not_connected') + ' · ' + state;
  } catch (error) {
    $('cjStatus').textContent = 'تعذر قراءة حالة CJ: ' + error.message;
  }
}

async function load() {
  const [overview, products, approvals, suppliers] = await Promise.all([
    apiCall('dashboard'),
    apiCall('list_products'),
    apiCall('list_approvals'),
    apiCall('list_suppliers')
  ]);

  $('overview').textContent =
    overview.overview.totalProducts + ' products · ' +
    overview.overview.pendingApprovals + ' pending approvals · ' +
    overview.overview.supplierRecords + ' supplier records';

  $('productsList').innerHTML = products.products.length
    ? products.products.map(item => `
      <div class="admin-row">
        <strong>${esc(item.source_title)}</strong> · ${esc(item.status)}
        <br><small>${esc(item.slug)} · ${esc(item.compliance_status)}</small>
      </div>`).join('')
    : 'No products yet.';

  $('approvals').innerHTML = approvals.approvals.length
    ? approvals.approvals.map(item => `
      <div class="admin-row">
        <strong>${esc(item.action_type)}</strong> · ${esc(item.status)}
        <br><small>${esc(item.id)}</small>
        <p class="admin-status">Recording a decision does not publish a product or execute a financial action.</p>
        <button class="admin-action" type="button" data-approval-id="${esc(item.id)}" data-decision="approved">Record approval</button>
        <button class="admin-action" type="button" data-approval-id="${esc(item.id)}" data-decision="rejected">Record rejection</button>
      </div>`).join('')
    : 'No pending approvals';

  $('suppliers').innerHTML = suppliers.suppliers.map(item =>
    '<div class="admin-row"><strong>' + esc(item.display_name) +
    '</strong> · ' + esc(item.integration_status) + '</div>'
  ).join('');
  status($('connection'), 'Authenticated with the current Supabase session.', true);\n  await loadCJStatus();
}

$('connect').addEventListener('click', async () => {
  $('connect').disabled = true;
  status($('connection'), 'بدأ الاتصال… جارٍ فحص جلسة المالك.', true);
  try {
    await load();
  } catch (error) {
    console.error('NOVA dashboard connection failed:', error);
    status($('connection'), 'فشل الاتصال: ' + (error?.message || 'خطأ غير معروف') + ' — افتح صفحة تسجيل دخول المالك ثم أعد المحاولة.');
  } finally {
    $('connect').disabled = false;
  }
});

$('approvals').addEventListener('click', async event => {
  const button = event.target.closest('button[data-approval-id][data-decision]');
  if (!button) return;
  const decision = button.dataset.decision;
  const approvalId = button.dataset.approvalId;
  const label = decision === 'approved' ? 'record approval' : 'record rejection';
  if (!window.confirm('Are you sure you want to ' + label + '? This records the decision only; it does not publish or pay.')) return;
  button.disabled = true;
  try {
    await apiCall('decide_approval', {
      approvalId, decision, note: 'Recorded from NOVA AI MANAGER dashboard.'
    });
    status($('connection'), 'Decision recorded. No publication or payment was executed.', true);
    await load();
  } catch (error) {
    status($('connection'), error.message);
    button.disabled = false;
  }
});

$('draftForm').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true;
  const form = new FormData(event.currentTarget);
  const body = Object.fromEntries(form.entries());
  body.public_price = body.public_price === '' ? null : Number(body.public_price);
  body.public_currency = body.public_currency === '' ? null : body.public_currency.toUpperCase();
  try {
    const result = await apiCall('create_product', body);
    status($('draftMessage'), 'Draft saved: ' + result.product.id, true);
    event.currentTarget.reset();
    await load();
  } catch (error) {
    status($('draftMessage'), error.message);
  } finally {
    submit.disabled = false;
  }
});

supabase.auth.getSession().then(({ data, error }) => {
  if (error) status($('connection'), 'Session check failed: ' + error.message);
  else if (data.session) status($('connection'), 'Session detected. Press Connect to verify owner access.', true);
  else status($('connection'), 'No active session. Sign in from the owner setup page.');
});


$('cjTest').addEventListener('click', async () => {
  $('cjTest').disabled = true;
  $('cjStatus').textContent = 'جارٍ اختبار الاتصال…';
  try {
    const result = await cjCall('test_connection');
    $('cjStatus').textContent = result.message || 'تم التحقق من اتصال CJ بنجاح.';
    await loadCJStatus();
    status($('connection'), 'CJ API authentication verified.', true);
  } catch (error) {
    $('cjStatus').textContent = 'لم يكتمل الاتصال: ' + error.message;
  } finally { $('cjTest').disabled = false; }
});

$('cjSearch').addEventListener('click', async () => {
  const keyword = $('cjKeyword').value.trim();
  if (!keyword) { $('cjResults').textContent = 'اكتب اسم المنتج أولاً.'; return; }
  $('cjSearch').disabled = true;
  $('cjResults').textContent = 'جارٍ البحث في كتالوج CJ…';
  try {
    const result = await cjCall('search_products', { keyword, page: 1, size: 20 });
    $('cjResults').innerHTML = result.products.length ? result.products.map(p => `
      <div class="admin-row">
        <strong>${esc(p.title || 'Unnamed product')}</strong><br>
        <small>SKU: ${esc(p.sku || '—')} · التكلفة: $${Number(p.costUsd || 0).toFixed(2)} · المخزون: ${Number(p.stock || 0)} · ${esc(p.category || 'غير مصنف')}</small><br>
        ${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="" loading="lazy" style="width:84px;height:84px;object-fit:contain;border-radius:8px;margin-top:8px">` : ''}
      </div>`).join('') : 'لم يتم العثور على منتجات مطابقة.';
    $('cjResults').insertAdjacentHTML('afterbegin', '<p class="admin-status">تم العثور على ' + Number(result.totalRecords || result.products.length) + ' نتيجة تقريباً. لم يتم استيراد أي منتج.</p>');
  } catch (error) {
    $('cjResults').textContent = 'تعذر البحث: ' + error.message;
  } finally { $('cjSearch').disabled = false; }
});
