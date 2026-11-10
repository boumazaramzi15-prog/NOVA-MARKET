# NOVA AI MANAGER — Architecture & Operating Plan

## 1. Approved direction
NOVA AI MANAGER is the central operations agent for NOVA MARKET, operating under the owner's supervision. NOVA MARKET is intended to be the customer-facing seller using a worldwide dropshipping model. The AI Manager is an internal operator, not merely a separate public chatbot.

## 2. Global multilingual capability — mandatory requirement
- The storefront, customer support, product content, and AI Manager must support customers and administrators in languages worldwide.
- Use automatic language detection for incoming customer messages and the admin interface, with a manual language selector always available.
- The initial interface language is Arabic, with English available as a second launch language. The architecture must allow additional languages without redesign.
- Build a translation/localization layer using language codes (BCP 47), Unicode/UTF-8 throughout, and locale-aware formatting for dates, numbers, currencies, addresses, and units.
- Store each product's canonical source content separately from translated title, description, attributes, SEO text, and policy snippets. Keep translation status and version history.
- AI-generated translations must preserve product specifications, measurements, warnings, legal meaning, prices, delivery conditions, and return conditions. Never invent missing product facts.
- Use human review for high-impact legal, safety, payment, refund, and policy translations before publication.
- Customer support replies should be drafted in the customer's detected/preferred language. Keep the original message and translated version linked for audit and escalation.
- Admin users may choose their own dashboard language independently of the customer's language.
- Support right-to-left layouts (Arabic and other RTL languages) and left-to-right layouts, including correct mixed-script handling.
- Search should support multilingual product names, synonyms, transliteration, and language-specific indexing where practical.
- Do not claim literal coverage of every language until quality has been tested. Maintain a language support registry with status: planned, machine-translated, reviewed, and fully supported.
- For unsupported or low-confidence languages, identify the limitation and offer a safe fallback instead of silently producing unreliable translations.

## 3. Core operating principles
- NOVA AI Manager is authorized as the autonomous day-to-day operator within the owner's documented policies, configured limits and reserved approval gates.
- It may independently research, compare, draft, maintain records, perform reversible non-financial operations, monitor workflows and resolve routine issues using approved tools.
- Owner approval remains mandatory for supplier payments and all spending, refunds, binding contracts/legal declarations, payment or bank settings, security/ownership changes, and materially consequential legal, tax, customs, privacy or safety decisions.
- Product publication, live pricing, campaigns and customer communications follow explicit evidence, policy and configured approval rules; do not treat autonomy as permission to bypass them.
- Draft only where approval is required; do not unnecessarily block routine permitted work.
- Least privilege: each agent module receives only the tools and data needed for its task.
- Traceability: record every automated action, approval, rejection, API call, message and important state change.
- Verify stock, shipping cost, delivery estimates, destination coverage, quality evidence and profit using current data; mark unknown information clearly.
- Customer information may be shared with a supplier only when needed for fulfilment and after privacy, legal and security controls are ready.
- Never store payment card details or put API keys, payment secrets, tokens or customer data in browser code or public Git files.
- If integrations, permissions, backend services or monitoring are unavailable, report the blocker honestly; never claim that an action or scheduled automation is live.

## 4. System architecture
1. NOVA storefront: localized product pages, search, cart, checkout handoff, order status, policies, and support.
2. Backend API: trusted server-side entry point for storefront, dashboard, AI Manager, suppliers, and payment webhooks.
3. Database: products, translations, supplier offers, destination shipping quotes, customers, orders, fulfilments, payments references, approvals, tasks, and audit events.
4. AI orchestration service: routes tasks to modules, supplies permitted context, validates tool arguments, detects language, and enforces approval gates.
5. Integration adapters: CJdropshipping, AliExpress/DSers, Zendrop, payment provider, email/notifications, and shipping/tracking services.
6. Owner dashboard: product review, approvals, orders needing attention, supplier status, support drafts, language settings, and profit reports.
7. Background jobs: stock/price checks, translation jobs, supplier sync, tracking updates, and webhook retries.
8. Audit and monitoring: agent decisions, language/translation metadata, errors, approvals, and execution history.
Choose hosting and database only after checking legal-business eligibility, payment availability, and supplier API access. Keep the design provider-neutral until then.

## 5. AI Manager modules
### A. Product Manager — first MVP
- Search approved supplier catalogues and match exact variants/SKUs.
- Compare product cost, shipping, destination coverage, delivery estimate, stock, quality evidence, and return conditions.
- Calculate estimated landed cost and proposed selling price/margin.
- Draft product content in the source language, then prepare localized versions for enabled storefront languages.
- Flag missing evidence, restricted categories, weak quality signals, and destination exclusions.
- Save all listings as Draft / Needs Review. Publish only after validation and owner approval.
### B. Supplier & Fulfilment Manager
- Monitor supplier connections, stock, prices, variant mapping, and shipping exceptions.
- Prepare supplier orders, submit only under configured approval policy, and import tracking events.
### C. Order Manager
- Track payment-to-delivery lifecycle and detect mismatches, late shipments, and exceptions.
- Verify payment status using signed server-side provider webhooks; never trust a browser redirect alone.
### D. Customer Support Manager
- Detect the customer's language and draft replies in that language.
- Use verified order and policy information; escalate complaints, chargebacks, damaged goods, missing parcels, and refund requests.
- Never promise an unverified delivery date or unapproved refund.
### E. Finance & Profit Manager
- Calculate estimated and realized margins including product cost, shipping, payment fees, discounts, refunds, and known taxes/duties.
- Report negative-margin products; never initiate payments or transfers.
### F. Marketing Manager
- Suggest localized promotions, bundles, product collections, and campaign drafts.
- Measure performance by language and destination when sufficient data exists.
- Require approval before public campaigns or unapproved live price changes.

## 6. Approval and permission matrix
| Action | Default permission |
|---|---|
| Search suppliers, compare offers, detect language | Automatic |
| Draft product content and translations | Automatic draft |
| Recheck stock and prices | Automatic |
| Save product as draft | Automatic |
| Publish product or translated legal/policy content | Owner approval |
| Place/pay supplier order | Owner approval initially |
| Share customer fulfilment data with supplier | Only after privacy/legal/security readiness and order rules |
| Issue refund or financially consequential replacement | Owner approval |
| Change payment, bank, API-secret, or account settings | Owner-only |
| Draft customer support reply in customer's language | Automatic draft |
| Send sensitive or policy-exception reply | Owner approval |
| Publish marketing campaign | Owner approval |

## 7. Core data entities
- products: canonical product identity, category, status, source content, images, public price, and compliance flags.
- product_translations: product ID, language code, translated fields, translation provider/model, review status, version, and timestamp.
- supplier_offers: supplier, supplier product/variant IDs, SKU, cost, currency, stock, source URL, last-checked time.
- shipping_quotes: supplier offer, destination, shipping price, service, delivery estimate, and quote timestamp.
- customers: minimum required profile, preferred language, and consent/privacy metadata.
- orders/order_items: customer order, currency, totals, verified payment reference, status, address snapshot, and cost snapshots.
- fulfilments: supplier order reference, status, tracking number, carrier, and event history.
- payments: provider references and verified payment/refund states; never raw card details.
- agent_tasks: task type, module, language, status, input references, draft output, errors, and retry state.
- approvals: requested action, amount/data scope, approver, decision, timestamp, and execution result.
- audit_events: append-only record of user, agent, integration, translation, and system actions.

## 8. Product publication validation
A product cannot be published unless the exact supplier variant, current cost/stock, destination shipping, delivery estimate, returns route, landed cost, margin floor, compliance checks, and content quality have been verified. Required translations must be completed and reviewed according to the risk level. Owner approval must be recorded.

## 9. Order lifecycle
Pending payment → Paid (verified webhook) → Risk/review check → Awaiting fulfilment approval → Submitted to supplier → Shipped → Delivered.
Exception states include payment failed, address review, supplier stockout, supplier price changed, fulfilment failed, tracking delayed, cancellation requested, refund pending approval, and refunded. All transitions must be server-validated, idempotent, and audited.

## 10. Security and reliability
- Server-side secrets management, HTTPS, authenticated admin access, role-based permissions, and MFA where available.
- Validate inputs and verify payment webhook signatures.
- Idempotency keys for payment and supplier-order operations.
- Rate limits, abuse protection, backups, retention rules, monitoring, and separate test/production environments.
- No real customer data or live financial operations in the first development phase.
- Never expose supplier credentials, private supplier pricing, or internal supplier names publicly unless explicitly required and approved.

## 11. Delivery phases
### Phase 0 — Readiness
- Confirm legal seller entity, sales destinations, tax/customs responsibilities, hosting/backend, and database.
- Verify supplier API eligibility and terms; select a payment provider that can onboard the actual seller entity and intended markets.
- Define enabled languages, translation quality levels, supported destinations, margin floor, and approval rules.
### Phase 1 — Product Manager MVP
- Build secure backend, database, admin authentication, audit log, translation/localization service, and approval queue.
- Add one supplier adapter in test mode, starting with CJdropshipping if account/API access is available.
- Import a limited set of candidate products, calculate destination-level costs, prepare localized drafts, and submit them for owner review.
- Do not enable public checkout or live fulfilment in this phase.
### Phase 2 — Store and order operations
- Build cart/checkout using a supported hosted/tokenized payment provider, verified payment webhooks, and order database.
- Add supplier fulfilment, tracking, cancellations, refunds, localized policies, and customer support with approval gates.
- Test end-to-end orders and refunds before a controlled launch.
### Phase 3 — Full AI operations
- Add support, finance, marketing, supplier-performance modules, multilingual analytics, alerts, and controlled automation.
- Expand supplier connections only after quality, cost, destination coverage, and API reliability are verified.

## 12. Current status — do not overstate
- This file records the approved direction and proposed architecture; it does not mean the AI Manager has been deployed.
- Supplier candidates are documented in SUPPLIERS.md, but no supplier account/API is connected yet.
- The current storefront remains a static product-discovery/referral implementation, not a functioning dropshipping checkout.
- No production backend, order database, payment gateway, AI agent, or live fulfilment workflow has been deployed.
- The next implementation step is Phase 0 architecture/hosting decision, then secure backend/database and the Product Manager MVP.

## 13. Definition of multilingual launch readiness
- The language registry lists each enabled language and its translation/review status.
- The storefront, navigation, search, checkout messages, order emails, and support entry points work in every enabled language.
- Arabic/RTL and English/LTR layouts are tested on mobile and desktop.
- Currency, dates, numbers, measurements, and address formats follow the selected locale without changing the underlying transaction values.
- Product claims, safety warnings, shipping conditions, refund terms, and privacy/legal texts receive human review before publication in each launch language.
- Language detection can be overridden by the customer, and the preference is saved with the customer profile where permitted.