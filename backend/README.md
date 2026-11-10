# NOVA MARKET Backend Foundation

## Current status
This folder contains the first database schema blueprint for NOVA MARKET. It is source code committed to GitHub, **not a running backend or live database**.

## Files
- `database/001_initial_schema.sql` — initial PostgreSQL schema for the product manager MVP and later order operations.

## Recommended build order
1. Select a hosting provider and managed PostgreSQL service only after checking account availability, legal eligibility, pricing, backups, and data-region requirements.
2. Create separate development/staging and production environments.
3. Apply the migration to a fresh development database and review the resulting schema.
4. Add server-side authentication for the owner dashboard. Store only the authentication provider's stable subject in `admin_users.auth_subject`; never implement password storage casually.
5. Add a backend API with input validation, role checks, rate limits, request IDs, and audit events.
6. Implement the first supplier adapter in test mode only after the supplier account, API access, terms, and supported destinations are verified.
7. Keep product imports in draft/review status. Do not enable public checkout, payment collection, supplier ordering, or customer-data sharing in this phase.

## Required security controls before real data
- Keep database credentials and all supplier/payment API secrets in server-side secret storage, never in the website JavaScript or Git.
- Use least-privilege database roles and explicit access policies.
- Protect customer addresses and define retention/deletion procedures.
- Verify payment webhook signatures server-side and make payment/fulfilment operations idempotent.
- Require owner approval for publishing products, supplier payments, refunds, and sensitive account changes.
- Test backup restoration, logging, monitoring, and incident response.

## Important launch blockers
The business entity and sales jurisdictions, payment provider eligibility for the actual seller, supplier API access, destination shipping coverage, taxes/customs, returns route, and legal policies still require verification. A static GitHub Pages site alone is not a secure dropshipping backend.
