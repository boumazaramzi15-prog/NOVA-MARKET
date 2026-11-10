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
