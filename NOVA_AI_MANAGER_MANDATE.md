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
