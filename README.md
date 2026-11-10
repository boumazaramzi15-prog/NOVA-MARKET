# NOVA MARKET

NOVA MARKET is being developed as a **direct-to-customer dropshipping store**, not an affiliate marketplace.

## Current preview
- `store.html`: bilingual English/Arabic storefront shell, responsive layout, category navigation, product search/sort interface and demonstration cart.
- `store.js`: storefront interactions. The product catalogue is intentionally empty until supplier, price, product details and shipping coverage are verified.
- `about.html`, `contact.html`, `shipping.html`, `returns.html`: customer-facing information pages.
- `admin-preview.html`: NOVA AI MANAGER planning dashboard preview only; it is not authenticated or connected to backend services.
- `backend/database/001_initial_schema.sql`: PostgreSQL schema blueprint; not applied to a live database.
- `NOVA_AI_MANAGER_ARCHITECTURE.md`: manager architecture and approval principles.
- `SUPPLIERS.md`: supplier research register; supplier accounts and APIs are not connected.

## Important limitations
This repository is a static preview. It does not yet have a production backend, live database, authentication, product catalogue, checkout, payment gateway, supplier API integration, order processing, fulfilment, tracking or customer service system. No real customer orders or payments can be accepted.

The cart is a front-end demonstration only. Checkout is deliberately disabled. Do not add API keys, payment secrets or customer personal data to this repository.

## Before public sales
1. Establish and verify the legal seller entity and required registrations in the operating jurisdiction.
2. Select production hosting and deploy a secure backend, database, authentication, audit trail and approval workflow.
3. Complete supplier due diligence and connect one supplier API using server-side secrets.
4. Import and verify product details, pricing, stock, shipping coverage and destination restrictions.
5. Complete customer terms, privacy, shipping, returns, tax and customs disclosures with qualified legal review.
6. Obtain an eligible merchant payment solution and complete its approval and integration.
7. Test the complete order-to-delivery and refund lifecycle before enabling checkout.

## Languages
The storefront preview supports English and Arabic UI text and switches RTL layout for Arabic. This is not yet full multilingual coverage. The database and architecture plans are intended to support additional locales with translation review and publication controls.


## Current implementation status (November 2026)
The repository now contains a bilingual storefront prototype, customer information pages, a NOVA AI MANAGER dashboard client, a Node.js/Express backend API foundation, a PostgreSQL schema draft, and backend CI tests. These are committed source files only: no runtime host, database, authentication provider, payment gateway, supplier API, live product inventory, or order fulfilment connection has been provisioned. Checkout is deliberately disabled. See `backend/DEPLOYMENT.md` before any deployment.

## Person-to-person marketplace (planned)
The storefront category navigation includes cars, car parts, used cars, motorcycles/scooters/quads, and real estate. A draft PostgreSQL migration defines seller, listing and listing-image records with new listings defaulting to pending review. This is a schema blueprint only: seller registration, secure authentication, listing submission, image uploads, moderation UI, public search API, reporting/blocking and production deployment are not yet implemented. The migration has not been applied to a live database. Do not invite public sellers or claim that listings can currently be submitted.
