# Backend setup and deployment

This is a runnable API foundation, not a deployed production service.

## Local setup
1. Install Node.js 20 or newer and PostgreSQL 15 or newer.
2. Create a new empty development database. Do not run these draft migrations against an existing production database.
3. From the `backend/` directory, apply the SQL files in order and stop on the first error:
   ```sh
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/001_initial_schema.sql
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/002_marketplace_listings.sql
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/003_payment_ledger.sql
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/004_operations_control.sql
   ```
   Migration 001 creates the core tables; 002 adds peer-to-peer listings; 003 adds the payment ledger; 004 adds inventory, price history, order/shipment events, support records, and automation-job definitions. These files are schema drafts and have not been applied to a live database. Review the resulting schema and constraints in development first.
4. Copy `.env.example` to `.env`, set DATABASE_URL, ALLOWED_ORIGINS and a unique random NOVA_OWNER_TOKEN of at least 32 characters. Keep all secrets out of Git and the browser.
5. Run `npm install`, `npm test`, then `npm start`.
6. Health check: `GET /api/health`.

## API outline
- Public: `GET /api/health`, `GET /api/languages`, `GET /api/products?lang=en`.
- Owner-only bearer token: `GET /api/admin/products`, `POST /api/admin/products`, `POST /api/admin/products/:id/request-publication`, `GET /api/admin/approvals`, `POST /api/admin/approvals/:id/decision`, `GET /api/admin/suppliers`.
- `POST /api/checkout` deliberately returns 503. No payment gateway or order-creation workflow is connected.
- The current API does not yet expose the new inventory, shipment tracking, support, or automation tables as live endpoints.

## Security requirements before connecting real data
- The SQL files do not yet define production Row Level Security policies or application-role grants. Do not expose the database or operational tables until RLS, least-privilege grants, and server-only access are designed and tested.
- Replace the bootstrap owner bearer token with an audited identity provider and role-based authorization before production.
- Store secrets in a server-side secret manager; configure TLS, database network restrictions, backups, monitoring, and real origin allowlists.
- Protect customer addresses and define retention/deletion procedures.
- Verify payment webhook signatures server-side and make payment/fulfilment operations idempotent.
- Require owner approval for publishing products, supplier payments, refunds, and sensitive account changes.

Do not expose this service publicly or enable checkout/supplier fulfilment until the seller entity, payment provider, consumer policies, destination-specific shipping/tax rules, supplier API access, RLS, and complete order/refund tests are approved.
