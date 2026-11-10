# Backend setup and deployment

This is a runnable API foundation, not a deployed production service.

## Local setup
1. Install Node.js 20 or newer and PostgreSQL 15 or newer.
2. Create a new empty development database.
3. Apply the schema: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/001_initial_schema.sql`.
4. Copy `.env.example` to `.env`, set DATABASE_URL, ALLOWED_ORIGINS and a unique random NOVA_OWNER_TOKEN of at least 32 characters.
5. Run `npm install`, `npm test`, then `npm start`.
6. Health check: `GET /api/health`.

## API outline
- Public: `GET /api/health`, `GET /api/languages`, `GET /api/products?lang=en`.
- Owner-only bearer token: `GET /api/admin/products`, `POST /api/admin/products`, `POST /api/admin/products/:id/request-publication`, `GET /api/admin/approvals`, `POST /api/admin/approvals/:id/decision`, `GET /api/admin/suppliers`.
- `POST /api/checkout` deliberately returns 503. No payment gateway or order-creation workflow is connected.

## Production blockers
Do not expose this service publicly until an audited identity provider replaces the bootstrap owner token, secrets are provisioned in a secret manager, TLS and database network restrictions are configured, migrations are reviewed/applied, backups/monitoring are enabled, and security tests are completed. Configure real origin allowlists. The bootstrap token is a temporary development gate, not a finished multi-user admin system.

Do not enable checkout or supplier fulfilment until the seller entity, payment provider, consumer policies, destination-specific shipping/tax rules, supplier API access and complete order/refund tests are approved.
