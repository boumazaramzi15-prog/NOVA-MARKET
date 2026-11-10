# NOVA AI MANAGER — Marketplace Expansion Mandate

Status: project instructions / implementation brief. This file does not mean an AI agent, database, API, or marketplace workflow is live.

## Mission
Prepare NOVA MARKET to support both:
1. NOVA's own direct-to-customer product catalogue (including supplier-fulfilled dropshipping).
2. A moderated person-to-person classifieds marketplace where individuals can publish items and property for sale.

Do not convert NOVA into a multi-vendor checkout marketplace unless the owner separately approves that business-model change. Person-to-person listings are advertisements/contact leads in the initial phase, not payments processed by NOVA.

## Required public categories
- Car parts and accessories.
- Cars.
- Used cars — individuals can advertise their own used vehicles.
- Motorcycles, scooters and quad bikes (ATV).
- Real estate for sale: houses, villas, apartments, commercial premises and other commercial property.

Keep motorcycles, scooters and quads together in one category. Keep used cars separate from the general cars category. Keep real estate separate from all vehicle categories.

## Seller listing requirements
Allow a person to create an account and submit a listing with:
- Listing category and clear title/description.
- Asking price and currency.
- Country, wilaya/state, municipality/city, and optional neighbourhood.
- Contact method, visible only according to the approved privacy settings.
- Photos uploaded through a secure image-storage service.
- Listing status, creation date and expiry date.

Vehicle-specific fields must be validated: make, model, year, mileage, condition, fuel, transmission and registration/document status where relevant.

Motorcycle/quad fields must include vehicle type (motorcycle, scooter, quad/ATV), make, model, year, condition and relevant engine details.

Real-estate fields must include property type, sale price, area, rooms where relevant, location, and seller-declared ownership/document status. Do not present legal ownership as verified unless independently checked.

Car-parts fields should include part name, compatible make/model/year range, condition (new/used), and part reference where available.

## Trust, safety and moderation
- Every new listing starts as pending_review; never publish user listings immediately by default.
- Provide report-listing, block/report seller, moderation notes, audit trail, expiry and removal flows.
- Detect duplicate, misleading, prohibited, stolen, counterfeit and suspicious listings; route uncertain cases to human review.
- Never claim that identity, ownership, vehicle papers, property title, or product authenticity is verified unless a real verification process has been completed.
- Never expose seller email, phone, account identifiers or private documents in public API responses.
- Validate and limit image type, size, quantity and storage access; do not accept arbitrary executable or unsafe uploads.
- Add rate limits, anti-spam controls, account verification and secure session authentication before public launch.
- Follow applicable consumer, privacy, advertising, property and vehicle-listing rules in each launch country. Start with a clearly scoped Algeria pilot only after legal review; do not assume one country's rules apply globally.

## Architecture and delivery order
1. Keep the existing NOVA direct-sales catalogue distinct from person-to-person listings.
2. Complete database migrations and server-side validation for listing types and attributes.
3. Implement secure seller registration/authentication and ownership checks.
4. Implement listing submission, image storage, edit, renewal, expiry and deletion.
5. Implement moderation queue, approval/rejection, reporting and audit logging.
6. Implement public search/filter by category, wilaya and municipality; show only published listings.
7. Build Arabic RTL and English UI first; keep translation architecture extensible.
8. Add tests for permissions, privacy, validation, moderation, abuse cases and public filtering.
9. Deploy only after database, storage, authentication, backups, monitoring and security review are configured.

## Financial and operational boundaries
- Person-to-person buyers and sellers initially contact each other; NOVA must not claim to hold funds, guarantee transactions, escrow payments, arrange title transfer or guarantee vehicle/property condition.
- Keep the existing NOVA product checkout disabled until legal seller setup, payment provider approval, shipping, supplier fulfilment and production testing are complete.
- Do not buy services, register domains, accept paid plans, sign supplier contracts, connect live payment accounts, submit supplier orders, issue refunds, or spend money without the owner's explicit approval.
- Never put credentials, API keys, owner tokens, customer data or private documents in GitHub or frontend code.
- Do not fabricate products, sellers, listings, prices, stock, shipping promises, reviews or verification badges.

## Completion reporting
For every implementation step, report the exact files/commit, tests run and pass/fail status. Clearly separate completed code from features requiring external accounts, secrets, production services, legal review or owner action. Never describe a planned or mocked feature as live.


## NEW OWNER DIRECTIVE — Build a deep NOVA-owned product catalogue

Priority: expand NOVA's own direct-sales catalogue as broadly as practical, across eligible product categories and international markets. The goal is a large, useful, well-organized catalogue — not a page padded with invented or unverified items.

### Product discovery and sourcing
- Research products from legitimate suppliers, manufacturers, wholesalers and dropshipping platforms that can lawfully fulfil orders to the intended destination countries.
- Cover a broad range of everyday categories where supplier evidence and fulfilment are available: electronics and accessories, computers, phones and accessories, home and kitchen, tools, automotive parts/accessories, fashion, shoes, bags, beauty/personal care, sports/outdoors, toys, office supplies and other suitable general merchandise.
- Keep regulated, hazardous, counterfeit, recalled, restricted or legally sensitive goods out of the catalogue unless the owner has explicitly approved a compliant category and all required checks are documented.
- For every candidate, record source/supplier name, source URL or supplier product ID, date checked, product identifier/SKU, variant details, wholesale cost, currency, destination-country availability, shipping cost and estimated delivery range, return policy, and any applicable restrictions.
- Confirm that images and product descriptions may legally be reused; prefer supplier-provided authorized media. Do not scrape or copy protected content in breach of source terms.
- Deduplicate by supplier SKU/GTIN/model and normalized product attributes. Merge variants under one product where appropriate.

### Verification before publishing
- Never invent a product, supplier, price, discount, stock level, rating, review, shipping promise, warranty or delivery date.
- A product may be marked READY only when supplier identity/source, current price, availability, shipping destination, shipping cost/timing, returns terms and permitted media have been checked.
- If any key field is unknown or stale, keep the item in DRAFT / NEEDS_VERIFICATION and do not show it as purchasable.
- Store the timestamp and source of every volatile field (price, stock, shipping and availability); re-check before checkout and before supplier order submission.
- Display destination-specific availability, shipping and possible customs/tax notices. Never imply worldwide shipping unless each destination is supported.
- Calculate retail pricing only from verified costs and owner-approved margin, fee, currency-conversion and tax rules. Do not set or change commercial margins without owner approval.
- Keep supplier cost and internal margin data private; expose only approved customer-facing fields.

### Catalogue organization and quality
- Build a searchable catalogue with category/subcategory, brand, model, SKU, variants, specifications, condition, images, description, price/currency, stock status, shipping destinations and last-verified date.
- Support Arabic RTL and English product content; preserve original source details internally and use accurate translations.
- Prioritize useful breadth and quality over raw item count. Do not publish duplicate, low-quality, misleading or unsupported listings just to make the store look full.
- Separate NOVA-owned direct-sale products from person-to-person classified advertisements at database, API, UI and checkout levels. Only NOVA-owned products may enter NOVA checkout.

### Autonomy and approval gates
- The manager may research, compare, deduplicate, enrich, translate and prepare draft catalogue records without spending money.
- The manager must not create supplier accounts, accept paid plans, purchase samples, sign agreements, place supplier orders, publish unverified items, change prices/margins, or enable live checkout without explicit owner approval.
- Never claim that this catalogue collection is running automatically unless a real scheduled agent, connected data source, backend job and monitoring have been deployed and verified.
- Deliver a progress report with counts for discovered, deduplicated, verified, draft and rejected products; list source coverage, blockers and exact files/tests. Do not report candidate count as verified catalogue count.


## NEW OWNER DIRECTIVE — Make NOVA available on phones, tablets and computers

Goal: deliver NOVA MARKET as a reliable cross-platform service:
- Android phones and tablets: publish an installable app through Google Play after all requirements and review are passed.
- Apple iPhone and iPad: prepare and publish an iOS app through the Apple App Store; Google Play does not distribute iOS apps.
- Computers: provide a responsive web experience for desktop and laptop browsers, with installable PWA support where technically appropriate.
- Keep the user experience, catalogue, accounts, favourites, order history and approved features consistent across platforms, subject to platform capabilities.

### Engineering requirements
- First make the existing website fully responsive and accessible on small Android/iPhone screens, tablets and desktop/laptop displays.
- Choose and document a maintainable cross-platform approach (for example, a shared web/PWA foundation plus native or cross-platform mobile wrappers where needed). Do not assume one Play Store package runs on Apple devices or desktop computers.
- Use shared, secure backend APIs; never embed secret keys or privileged credentials in mobile apps or frontend code.
- Support Arabic RTL and English, adaptive layouts, accessible controls, robust loading/error/empty states, and reasonable performance on lower-end phones and slower networks.
- Implement secure authentication, privacy controls, account deletion where required, consent and data disclosures, and secure handling of user-generated content before public release.
- Add platform-appropriate push notifications only with user permission and a documented notification preference flow.
- Test on representative Android and iOS devices/simulators, multiple screen sizes, and current desktop browsers. Include automated tests, accessibility checks, performance checks and security review.

### Store publication requirements
- Prepare Android package identifiers, signing, app icons, screenshots, store listing, privacy policy, support contact, content rating, data safety declarations and Google Play compliance materials.
- Prepare Apple bundle identifiers, signing/provisioning, app icons, screenshots, App Store listing, privacy disclosures, age rating, support details and Apple review compliance materials.
- Do not claim either app is published or approved until the relevant store confirms approval and the public listing is accessible.
- App Store / Play Store developer accounts, identity verification, fees, legal entity requirements and final submissions require owner participation and explicit approval. Never purchase accounts or submit legal declarations on the owner's behalf without approval.
- Before release, verify payment flows against each platform's rules; do not assume a web payment integration can be used unchanged for digital goods or in-app purchases.

### Delivery gates
1. Audit the current website and repository; report what is reusable and what is missing.
2. Implement responsive web/PWA experience and shared API architecture.
3. Implement and test Android and iOS builds using the selected approach.
4. Complete privacy, security, accessibility, performance and store-policy reviews.
5. Prepare store assets and submission packages.
6. Submit only after the owner approves accounts, fees, legal declarations and final release candidate.

Never describe a responsive website, PWA, prototype, emulator build or unsigned package as an app published in a store. Report exact supported platforms, tested devices/browsers, build artifacts, test results, remaining owner actions and publication status separately.

## NEW OWNER DIRECTIVE — Worldwide language coverage across website and apps

Owner requirement: NOVA MARKET must be designed for **all languages of the world, without intentionally excluding any language**, across the website, PWA and Android/iOS applications. Arabic must remain supported permanently; do not remove it, hide it, or make it the only default. English, French, German and every other language must be supported through the same extensible system.

### Language and locale requirements
- Build a language architecture that can add and serve every language and locale that can be represented and supported by the platform, including regional variants, local scripts and right-to-left (RTL), left-to-right (LTR) and bidirectional text.
- Use Unicode end-to-end and standards-based locale/language identifiers (BCP 47). Do not hard-code a short fixed list of languages into application logic or database schemas.
- Provide a language selector that lets each visitor/user choose their preferred language on the website and in every app. Respect an explicit saved choice; otherwise use a sensible browser/device-language suggestion and allow the user to change it at any time.
- Localize all user-facing surfaces, not just the home page: navigation, buttons, forms, validation, errors, empty/loading states, account and privacy screens, catalogue/category labels, product content, search/filter controls, checkout/order status, notifications, help and legal/support content.
- Support locale-aware dates, times, numbers, currencies, plural rules, sorting and address formats. Keep transaction amounts and original product/source data unambiguous; translation must never alter prices, legal terms, product specifications or other critical facts.
- Support mixed-language content and correct font fallback, text shaping, line breaking, accessibility labels and layout expansion. Test RTL/LTR switching and scripts with different writing directions and character sets on phones, tablets and computers.
- Keep translation resources separate from application code, use translation keys rather than embedded UI strings, and provide a scalable workflow for adding languages without rebuilding the entire product architecture.
- For product titles/descriptions and user-generated listings, preserve the original language and make translated versions clearly identifiable. Never fabricate a translation or imply human review where none occurred.
- Machine translation may be used as a draft where appropriate, but mark unreviewed translations internally and require human review for safety-critical, legal, payment, policy and other high-impact content before presenting it as authoritative.
- If a language or locale lacks a verified translation for a particular string, use a clearly handled fallback and never show blank UI or broken keys. Do not claim complete, high-quality coverage for a language until its content has been translated and tested.
- Provide accessible language names (prefer native language names where practical), keyboard/screen-reader support, and search within the language selector for a very large language list.
- Do not impose English or any other language as the only language. Do not delete existing Arabic translations or Arabic RTL support during redesigns, migrations or app releases.

### Delivery and verification gates
1. Audit all existing website, backend, database, PWA and app strings and identify untranslated or hard-coded text.
2. Implement a shared, scalable internationalization/localization foundation used consistently by the website and Android/iOS apps.
3. Build the language/locale registry and translation-management workflow so additional languages can be added continuously, rather than limiting NOVA to a fixed handful.
4. Test representative scripts, RTL/LTR and bidirectional text, long translations, locale formatting, search, accessibility and language switching across supported devices and browsers.
5. Report the exact languages/locales actually translated and tested, remaining untranslated content, fallback behavior and any technical limitations. Never claim that every language is fully translated merely because the architecture can accept it.

This directive records the owner's global-language requirement; it does not mean that all translations, language data, apps or website changes have already been implemented or published.


## NEW OWNER DIRECTIVE — Native and installable NOVA experience on phones and Windows PC

Owner requirement: NOVA MARKET must be usable as an app on phones and as an app on Windows desktop/laptop PCs. This is an explicit platform requirement, not merely a responsive-design suggestion.

### Required platforms
- Android phones and tablets: provide an installable Android application and prepare Google Play publication.
- Apple iPhone and iPad: provide an installable iOS application and prepare Apple App Store publication.
- Windows 10/11 PCs and laptops: provide a Windows-compatible installable desktop experience. Evaluate a signed Windows desktop package (such as MSIX) and/or an installable PWA; choose the most maintainable secure option and document the decision. The Windows experience must support normal desktop use, keyboard/mouse, resizing, accessible controls and Windows installation/uninstallation expectations.
- Keep the website available in current desktop browsers as well; a Windows app does not replace the web version.
- Use a shared secure backend and consistent accounts, catalogue, favourites, orders and language preferences across phone, Windows and web experiences.

### Delivery and verification
1. Audit the existing repository and determine the best practical architecture for Android, iOS, Windows and web without duplicating business logic.
2. Implement the responsive web foundation and shared backend/API contracts.
3. Produce installable Android and iOS builds and a Windows-compatible installable build/PWA, as appropriate to the selected architecture.
4. Test on real or representative Android/iOS devices and Windows 10/11 environments, including installation, updates, sign-in, language switching, accessibility, offline/error states and security.
5. Prepare store/package signing and release assets. Do not claim an app is published in Google Play, Apple App Store or Microsoft Store until the store confirms approval and its public listing is accessible.
6. Clearly report which platform builds actually exist, their signing/installation status, test results, and any external account, certificate, fee or owner approval still required.

Do not describe a mobile-only build as Windows support. Do not describe a browser page as a packaged Windows desktop app unless the installable PWA experience is actually implemented and tested. This directive records the owner's requirement; it does not mean any new app build has already been created or published.


## NEW OWNER DIRECTIVE — Same-minute synchronization across website and every app

Owner requirement: **Any content or data update made in NOVA must be reflected on the website and all NOVA applications within the same minute**, without requiring users to manually refresh or install a new app version for ordinary data changes.

### Single source of truth
- Use one shared, authoritative backend and database for the website, Android app, iOS app and Windows app. Do not maintain separate independently editable catalogues, inventories, order records, listing records, prices or user settings per platform.
- All platforms must read and write through the same authenticated backend APIs and permission rules. A change accepted by the backend becomes the canonical version for every platform.
- Synchronize ordinary business data (including product details, approved prices, stock/availability, categories, listings and moderation status, orders and status, account preferences, favourites and supported settings) across all clients.

### Same-minute propagation
- Target propagation to all online clients within 60 seconds of a successful backend commit; aim for near-real-time updates where practical.
- Implement a reliable change-notification mechanism such as WebSockets or Server-Sent Events, with push notifications where appropriate and permitted. Use polling or a safe refresh fallback if a persistent connection is unavailable.
- Invalidate or refresh relevant client caches when a change event arrives. Do not let stale cached values overwrite newer server data.
- Use version numbers, timestamps or equivalent ordering metadata, idempotent event handling, retry/reconnect logic and conflict resolution so clients converge on the latest canonical state.
- If a device is offline, queue safe local actions only where explicitly supported; when it reconnects, reconcile with the backend and fetch the latest state. Clearly indicate pending/offline changes and never promise same-minute delivery to a disconnected device.
- Ordinary data/content changes must not require a new app-store release. A new app build is required only when the application code or platform package itself changes.

### Security and operational safeguards
- Enforce server-side authorization for every update and every subscription; users must receive only data they are allowed to access.
- Keep private account data, seller contact details, moderation notes and internal supplier/cost data out of public broadcasts and unauthorized clients.
- Publish change events only after the corresponding database transaction commits. Do not broadcast failed, unapproved or rolled-back changes.
- Preserve approval gates: synchronization must not automatically publish pending listings, unverified products, unapproved prices or other content awaiting owner/moderator approval.
- Log synchronization failures and monitor event delivery, client lag, reconnects and data-version mismatches. Provide a recovery path that performs a full authoritative refresh.

### Acceptance tests and reporting
1. Update a test product or setting once through the authorized backend/admin flow and verify the updated value appears on website, Android, iOS and Windows clients within 60 seconds while each client is online.
2. Verify no manual refresh is needed for connected clients; test reconnect and offline recovery separately.
3. Test simultaneous edits, duplicate/replayed events, failed transactions, cache invalidation, permission boundaries and unapproved/pending content.
4. Report measured propagation times per platform, test environment/build versions, failures and any unsupported/offline limitations. Do not claim same-minute synchronization is implemented until these tests pass on actual deployed services and supported clients.

This directive defines the required behavior; it does not mean shared live synchronization, backend services or application builds have already been implemented.


## NEW OWNER DIRECTIVE — Show base product price first, calculate destination costs at checkout

Owner requirement: On NOVA product cards and product pages, show the **product price only**, excluding delivery and other destination-dependent charges. Do not silently add estimated fees to that displayed base price. Clearly label it as the product price, with delivery/taxes/other applicable charges calculated and shown separately before the customer confirms payment.

### Customer checkout journey
1. The customer selects a NOVA-owned product and its required options/quantity. Show the product price and currency clearly; state that delivery and applicable destination charges are calculated after the delivery location is provided.
2. At checkout, collect only the information needed to quote and fulfil the order. Ask for the destination country and postal/region/city/address as required by the carrier and supplier. Collect recipient name and contact details only when required for delivery, account, fraud prevention or legal obligations.
3. After the customer provides the destination details, invoke the approved shipping/tax/fee calculation services and supplier/carrier quote sources. An AI pricing/checkout assistant may coordinate these services, validate the result, explain the breakdown and present it to the customer; it must not invent or guess fees.
4. Before payment, show a clear itemized summary: product price, quantity, delivery/shipping, taxes/VAT, customs/import duties or handling charges where reliably calculable, payment/provider fees only if contractually chargeable to the customer and legally permitted, discounts, and the final payable total with currency.
5. Identify charges that cannot be determined at checkout (for example, duties assessed by the destination authority on import). Explain clearly whether they are excluded and may be payable on delivery; never present an uncertain estimate as a guaranteed final charge.
6. Let the customer review and explicitly confirm the complete order total before initiating payment. If a quote expires or supplier/carrier costs change before payment, recalculate and ask the customer to approve the revised total; never charge an undisclosed difference.
7. Keep person-to-person classified ads outside this NOVA direct-sales checkout and fee calculation unless the owner separately approves a different model.

### Pricing, discount and profit protection
- Keep the displayed base product price distinct from destination-dependent checkout costs.
- Apply a supplier discount to NOVA's sourcing cost where it is genuinely available and verified. Do not automatically copy a supplier's retail promotion or discount percentage as NOVA's customer discount.
- Show a customer discount only when the owner-approved pricing rules authorize it and the resulting order remains profitable after product cost, fulfilment, shipping subsidies, payment fees, currency conversion, taxes borne by NOVA, refunds/returns allowance and other applicable costs.
- Calculate and verify NOVA's expected net margin privately before allowing checkout. Never expose supplier cost, internal margin or confidential commercial terms to the customer.
- If a valid shipping/tax quote or cost input is unavailable, show that the total cannot yet be confirmed and block payment or request manual review; do not fabricate a total or promise free shipping.
- Recheck product availability and all relevant quotes immediately before payment/order submission. Do not place a supplier order until the customer's payment is confirmed and the applicable approval rules are satisfied.

### Personal-data protection
- Explain why each checkout field is needed and obtain any required consent before sharing address/contact information with a supplier, carrier, tax/shipping service or other processor.
- Send only the minimum necessary customer data to each authorized service; do not send personal details to a general-purpose AI model unless an approved privacy/security assessment and lawful basis explicitly permit it.
- Keep addresses, phone numbers, email addresses and order details out of public product pages, analytics events, logs, AI prompts and GitHub. Encrypt data in transit and at rest, restrict staff/service access, define retention/deletion periods and support applicable privacy rights.
- The AI assistant should receive only the destination and order attributes necessary for a quote whenever possible, preferably through controlled backend tools; it must not retain or reveal personal information.

### Acceptance tests and reporting
1. Verify that catalogue/product pages display only the base product price and clearly disclose that destination costs are calculated later.
2. Test multiple destination countries/regions and verify every displayed fee comes from a current, traceable carrier, supplier, tax or payment-provider source.
3. Verify the checkout breakdown and final total are shown before payment, with explicit customer approval and correct currency/rounding.
4. Test missing, expired, changed and unavailable quotes; payment must be blocked or reconfirmed when the total is uncertain or changes.
5. Verify profit-floor rules, supplier discount handling, privacy permissions, data minimization and separation from person-to-person listings.
6. Report actual service integrations, countries covered, quote accuracy/limitations and test results. Do not claim AI fee calculation or live checkout is operational until the backend integrations and end-to-end tests are deployed and passed.

This directive defines the intended customer journey; it does not mean shipping, tax, AI calculation, personal-data processing or payment integrations are currently live.


## NEW OWNER DIRECTIVE — Cancellation handling and supplier/carrier refund verification

Owner requirement: When a customer requests cancellation of a NOVA direct-sale order, NOVA AI MANAGER must first check the actual order stage and the supplier/carrier cancellation and refund terms. **Do not automatically promise or issue a full refund until the recoverable amounts and applicable policy have been verified.**

### Cancellation workflow
1. Immediately record the customer's cancellation request with timestamp and order ID, acknowledge receipt, and place the order into a cancellation-review state. Do not mark it cancelled or refunded merely because the request was received.
2. Check the order stage:
   - **Not yet submitted to supplier:** stop fulfilment and verify whether any payment/provider fees or other costs are non-refundable.
   - **Submitted to supplier but not dispatched:** contact/check the supplier's actual cancellation policy and obtain confirmation of whether the supplier accepts cancellation and what amount will be returned.
   - **Dispatched / handed to carrier:** check whether interception, return-to-sender or refusal is possible; verify carrier charges, return-shipping charges, and supplier return eligibility before calculating any refund.
   - **Delivered:** handle as a return request under the applicable NOVA policy and destination-country consumer law, not as a simple pre-dispatch cancellation.
3. Verify each amount from the relevant supplier, carrier, fulfilment provider and payment provider records or written confirmation. Record the source, date/time checked, currency, amount, status and any expected refund date.
4. Distinguish clearly between:
   - product/supplier amount recoverable;
   - outbound shipping charge recoverable or non-refundable;
   - return/interception shipping and handling costs;
   - payment processing or currency-conversion fees that are actually non-refundable;
   - taxes/duties and whether they can be reclaimed;
   - any other documented, lawful and policy-permitted deductions.
5. Calculate the customer's refund according to the published NOVA cancellation/returns policy and mandatory consumer law in the customer's destination country. Do not deduct costs from the customer unless the deduction is lawful, disclosed in advance and supported by the applicable policy and evidence.
6. Give the customer a clear status update: cancellation requested, supplier/carrier confirmation pending, cancellation accepted/rejected, expected refundable amount or why it is not yet determinable, and the expected processing timeline once confirmed.
7. Issue a refund only after the cancellation/return outcome and refund amount are verified, through the original payment method where required and supported. Record the payment-provider refund reference and final status. Never claim a refund has been sent until the provider confirms it.
8. If the supplier or carrier has not replied, the refund is disputed, the amount is unclear, or the case involves legal exceptions, escalate to a human/owner for review. Do not invent an outcome or silently close the request.

### Customer fairness and financial controls
- Do not assume every supplier or shipping company returns money after cancellation. Check the specific supplier, service, shipment stage and destination terms for each order.
- Do not assume that a carrier's refund to NOVA automatically determines the customer's legal refund entitlement; NOVA must follow its customer-facing policy and applicable law.
- Keep internal supplier costs, recovery negotiations and NOVA margin private. Explain customer-facing charges and refund calculations transparently.
- Maintain an auditable record of the request, supplier/carrier responses, evidence, calculation, approvals, customer communications and payment-provider result.
- Keep person-to-person classified advertisements outside this NOVA order-cancellation workflow unless the owner separately approves otherwise.
- Do not spend money, pay return/interception fees, accept supplier penalties, or make exceptional refund decisions without the required owner approval.

### Acceptance tests and reporting
1. Test cancellation before supplier submission, after supplier acceptance but before dispatch, after dispatch and after delivery.
2. Verify supplier/carrier refundability from real documented terms or confirmations, including partial and non-refundable charges.
3. Verify refund calculations, lawful customer disclosures, approval gates and original-payment-method handling.
4. Test delayed/no supplier response, carrier refusal, failed refund and duplicate cancellation/refund events.
5. Report actual integrations and test results. Do not claim automated supplier/carrier checks or refunds are live until the relevant services are connected and end-to-end tests pass.

This directive defines the required cancellation process; it does not mean supplier/carrier integrations, cancellation automation or refunds are currently operational.


## NEW OWNER DIRECTIVE — Destination-country import eligibility and supplier-policy alignment

Owner requirement: NOVA MARKET must prevent avoidable disputes by accepting orders only when the selected supplier can fulfil the exact product to the customer's destination and the product may lawfully be imported there. Supplier terms must be checked and aligned with NOVA's customer-facing operational policies, while mandatory consumer-protection and other applicable laws always take precedence.

### Before listing or accepting an order
- For every product and destination country, verify that the supplier currently ships that exact product/variant to the destination, and record the supplier/source, date checked, restrictions, shipping method, delivery estimate and applicable terms.
- Check known destination-country import restrictions, prohibited/restricted goods, permits, sanctions and carrier limitations using reliable, current sources. Do not infer that a product is importable merely because the supplier lists it or ships it elsewhere.
- If the supplier does not serve the destination, the product is prohibited/restricted without a verified required authorization, or reliable eligibility cannot be established, mark the product/destination as unavailable and block checkout for that destination.
- If eligibility or shipping information is incomplete, conflicting or stale, do not accept payment. Keep the order in a verification/manual-review state until confirmed.
- Recheck destination eligibility, supplier availability, shipping terms and relevant restrictions immediately before payment and before submitting the supplier order.

### Supplier-policy alignment
- Maintain a versioned record of each supplier's actual shipping, cancellation, return, refund, warranty and damaged/lost shipment terms, including source and last-verified date.
- Align NOVA's operational procedures with the applicable supplier terms and disclose relevant customer-facing conditions clearly before purchase.
- Do not promise shipping, cancellation, return, replacement, warranty coverage or refund outcomes that the supplier has not confirmed.
- Supplier terms do not override mandatory laws or statutory customer rights in the customer's destination country. Where supplier terms conflict with applicable law or NOVA cannot fulfil its legal obligations, block the sale or escalate for legal/owner review; do not transfer an unlawful term to the customer.
- If customs refuses or seizes a shipment, investigate the actual reason, supplier/carrier responsibility, destination rules and customer rights. Do not automatically deny a refund or charge the customer; apply the published policy and mandatory law based on documented facts.

### Checkout disclosures and audit trail
- Before payment, show the customer whether the product is eligible for delivery to the selected destination, the confirmed delivery terms, known import restrictions and any duties/taxes that are excluded or may be assessed by authorities.
- Do not describe customs clearance as guaranteed. Do not promise that NOVA can prevent customs delays, seizure or refusal.
- Keep evidence of destination checks, supplier confirmations, policy versions, customer disclosures, quote timestamps and order decisions for dispute handling.
- Keep person-to-person classified advertisements separate; this destination/supplier fulfilment gate applies to NOVA-owned direct-sale products.

### Acceptance tests and reporting
1. Verify that a supplier-excluded destination is blocked before payment.
2. Verify that prohibited/restricted or uncertain products are unavailable or routed to review, not purchasable by default.
3. Verify that supplier terms are versioned and customer disclosures reflect the applicable policy without overriding mandatory law.
4. Test changes to supplier shipping coverage, stale checks, conflicting information and customs refusal scenarios.
5. Report destination/product coverage, evidence sources, last-check dates, blocked cases and test results. Never claim a country/product is cleared unless the relevant checks have actually been completed.

This directive defines required controls; it does not mean destination screening, supplier integrations, legal checks or checkout blocking are currently implemented or live.


## NEW OWNER DIRECTIVE — NOVA blind-shipping and neutral-parcel supplier request

Owner requirement: When NOVA purchases a customer's order from a supplier for direct fulfilment, the order workflow should automatically send the supplier a clear fulfilment instruction requesting neutral / blind shipping so the parcel does not advertise the supplier's brand to NOVA's customer.

### Automatic supplier instruction
- After the customer's order is confirmed and the supplier order is ready to be submitted, send the supplier the approved instruction below through the supplier's supported order notes, API or messaging channel:
  
  "Please fulfil this order on behalf of NOVA MARKET. Use neutral, unbranded packaging where available. Do not include supplier-branded marketing materials, promotional flyers, catalogues, business cards, QR codes, discount coupons, or invoices showing supplier retail branding or supplier sales details to the end customer. Do not add your own logo or store name to the outer parcel or product presentation where removal is supported. Please do not contact or market directly to the end customer for promotional purposes. If NOVA MARKET-branded packaging or inserts are available and authorized, use them only according to NOVA's approved brand files and instructions. Please confirm any extra fee or limitation before dispatch."

- Include the NOVA order reference and only the minimum delivery/order information the supplier needs to fulfil the shipment. Never send unrelated customer data.
- Record the instruction, supplier response, timestamp, order reference and any extra charge or limitation in the order audit trail.
- If the supplier cannot support neutral packaging, charges an additional fee, or does not confirm the request, flag the order for owner review before submission/dispatch where practical. Do not claim blind shipping is guaranteed.
- Do not automatically pay for branded packaging, custom inserts, packaging upgrades or other extra services without explicit owner approval.

### Legal and fulfilment safeguards
- This is a request for neutral presentation / blind dropshipping; it does not authorize false customs declarations, undervaluation, false country-of-origin statements, removal of legally required sender/importer details, concealment of safety information, or omission of documents required by customs, tax, consumer or product-safety law.
- Preserve accurate invoices, customs declarations, product labels, safety notices, warranty information and legally required sender/return details. Where a supplier must identify itself for legal or carrier reasons, comply and disclose the limitation to NOVA internally.
- Do not claim NOVA manufactures the product, owns the supplier's factory, or is an authorized brand owner unless that is factually true and documented. NOVA may present itself as the retailer / seller of record only where its legal and commercial arrangements support that role.
- Do not remove third-party trademarks from products or packaging where doing so would breach intellectual-property rights, product-safety rules or supplier agreements. Request neutral outer packaging and removal of optional promotional materials only where permitted.
- Customer-facing order communications should identify NOVA as the customer's point of contact, while preserving all legally required seller, manufacturer, importer and warranty disclosures.

### Automation and acceptance tests
1. Verify the supplier instruction is attached to every eligible NOVA direct-sale supplier order before submission.
2. Verify that supplier-specific exceptions, fees and confirmations are recorded and escalated when needed.
3. Test that no customer order is sent twice because of retries; use idempotency and an auditable send status.
4. Verify customs, tax, safety and legally required documents are never suppressed or falsified.
5. Report which supplier channels support automated order notes/messages and which require manual action. Do not claim automated messaging is live until a real supplier integration is connected and end-to-end tested.

This directive defines the required blind-shipping workflow; it does not mean supplier messaging, integrations or neutral packaging are currently operational or guaranteed.


## NEW OWNER DIRECTIVE — NOVA supplier agent with mandatory owner payment approval

Owner decision: NOVA AI MARKET may autonomously handle supplier research, communication and order preparation, but **every payment to a supplier requires the owner's explicit approval immediately before payment**. The agent must never pay a supplier automatically or treat customer order confirmation as permission to pay the supplier.

### Permitted autonomous work (without spending money)
- Discover and compare suppliers; verify supplier identity and contact channels.
- Request quotations, negotiate prices and terms, check stock, variants, shipping destinations, delivery estimates, return/cancellation terms and neutral/blind-shipping capability.
- Prepare supplier purchase orders and draft messages, attach the neutral-packaging instruction, request written confirmation, and track supplier responses.
- Recheck price, stock, destination eligibility, shipping costs and supplier terms before presenting a purchase for approval.
- Prepare order records, shipment follow-ups, tracking updates, exception reports and draft dispute/cancellation messages.
- Keep a complete audit trail of supplier communications, quotations, evidence, timestamps, order references and status changes.

### Mandatory payment approval gate
- Before any supplier payment, present the owner with a clear approval screen/record containing supplier identity, verified supplier order details, product/variant/quantity, unit and total cost, currency, shipping and all known extra fees, destination, delivery estimate, refund/return terms, payment method and the NOVA/customer order reference.
- The owner must give a specific, affirmative approval for that exact supplier, amount, currency and order. Approval for one order or amount does not authorize another order, a changed amount, a recurring payment or a later retry.
- If the supplier changes the price, quantity, shipping, fees, payment destination or other material order detail, invalidate the previous approval and request a new one.
- No payment may be initiated, captured, released or retried without the matching valid approval. No silence, timeout, preselected checkbox, general account permission or customer checkout confirmation counts as owner approval.
- Use idempotency and payment-state checks to prevent duplicate charges. If payment status is uncertain, stop and reconcile with the payment provider before retrying.
- If owner approval is declined or unavailable, keep the supplier order unpaid and pending; notify the owner and do not imply that the purchase or dispatch is confirmed.
- Never store or request the owner's card PIN, password, one-time code or other authentication secret. Use an approved payment provider's secure authorization flow; the owner completes any required authentication directly.
- Supplier refunds, cancellation penalties, return-shipping charges, upgrades, samples, subscriptions and any other supplier-side spending also require explicit owner approval unless a separate, narrowly defined written spending limit is later approved.

### Separation of customer and supplier approvals
- Customer confirmation and customer payment authorize only the customer-side transaction under NOVA's published checkout flow; they do not authorize the agent to pay the supplier.
- A supplier order is not confirmed as paid or dispatched until the payment provider and supplier independently confirm the relevant statuses.
- Do not promise a dispatch date based only on a prepared purchase order or pending payment.

### Acceptance tests and reporting
1. Verify that every supplier payment path is blocked without a matching owner approval.
2. Verify approval is bound to the exact supplier, order, amount, currency and material order details.
3. Verify any material change invalidates approval and requires a fresh approval.
4. Test declined, expired, missing, duplicate and uncertain payment states; all must fail safely without duplicate payment.
5. Verify the owner can review the complete cost and terms before approval, and every decision is auditable.
6. Report which supplier messaging and payment integrations are actually connected and tested. This directive is a required design/implementation rule; it does not mean the supplier agent, payment approval UI, supplier integrations or automated payments are currently live.


## NEW OWNER DIRECTIVE — Autonomous day-to-day NOVA AI Manager

Owner approval: NOVA AI Manager is authorized to act as the autonomous day-to-day business operator for NOVA MARKET within the boundaries below. This expands operational autonomy; it does not grant authority to spend money, make legal commitments, or bypass compliance.

### Actions the manager may perform autonomously
- Research markets, competitors, products and suppliers; compare options and maintain evidence and timestamps.
- Contact suppliers through approved, connected channels to request information, quotations, stock checks and permitted neutral-packaging terms; negotiate non-binding terms within owner-approved limits.
- Create, update, translate, categorize, deduplicate and quality-check internal product drafts; process authorized supplier media for removal of optional supplier advertising/branding where permitted.
- Keep manufacturer/product trademarks and legally required labels, safety notices, certifications, origin and importer information intact. Never remove a manufacturer's identity or misrepresent who made a product.
- Prepare product pricing recommendations using owner-approved pricing and margin rules; do not change live prices or margins outside those rules.
- Monitor orders, stock, delivery, customer messages and supplier performance; prepare routine status updates and send approved template communications using verified facts.
- Resolve routine operational issues within documented policies and pre-approved limits; escalate unusual, high-risk, ambiguous or policy-exception cases.
- Prepare and maintain reports, dashboards, task queues, audit logs and recommendations; identify problems and take reversible, non-financial corrective actions.
- Run scheduled checks and background tasks only after the required real integrations, permissions, monitoring and deployment exist.

### Reserved owner approval
The manager must stop and obtain the owner's explicit approval before:
- Any supplier payment, purchase, sample, subscription, paid service, refund, charge, transfer or other expenditure.
- Signing or accepting binding contracts, supplier terms, legal declarations, financial commitments or changes to legal/business identity.
- Decisions with material legal, regulatory, tax, customs, privacy, intellectual-property or product-safety consequences; uncertain cases must be escalated for qualified human review.
- Changing payment/bank settings, credentials, security controls, access permissions or ownership.
- Publishing a product, campaign, claim or policy where required evidence, legal review or the existing publication gate is not satisfied.
- Any action outside the approved budget, pricing rules, destination scope, supplier terms or documented operating policies.

### Safety, transparency and accountability
- Autonomy means acting within approved policies, not unlimited authority. Apply least privilege and maintain an auditable record of inputs, evidence, decisions, messages and state changes.
- Never fabricate supplier contact, negotiations, product verification, customer communications, completed work or live integrations.
- If a required tool, account, backend, data source or permission is unavailable, report the blocker and prepare the next safe draft; do not pretend the action occurred.
- Stop on conflicting instructions, uncertain payment state, suspected fraud, security incidents, customer harm or material legal/compliance uncertainty; notify the owner.
- The owner can pause or revoke delegated permissions. Provide clear reporting of actions taken, pending approvals, exceptions and unresolved risks.
- This directive authorizes the operating model only. It does not mean an autonomous agent, scheduled jobs, supplier connections, messaging, payment system or production backend is currently deployed or operational.
