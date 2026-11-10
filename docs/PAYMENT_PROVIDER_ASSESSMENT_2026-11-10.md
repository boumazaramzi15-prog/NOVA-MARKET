# NOVA MARKET — International payment provider assessment
Date: 2026-11-10
Status: research / decision pending; no provider connected.

## Business model and scope
- This assessment covers checkout for products sold directly by NOVA MARKET.
- Peer-to-peer classified listings are excluded. NOVA does not collect buyer/seller funds for those listings in the initial phase.
- Target buyers: international customers.
- Seller/operator base: Algeria.
- Current known constraint: NOVA owner has not yet supplied evidence of an Algerian commercial registration or a qualifying foreign legal entity.

## Findings from official provider material

### 2Checkout / Verifone — first candidate, not approved
- Official global-payments country selector includes Algeria and lists DZD plus Visa, Mastercard, American Express, bank transfer, PayPal and other methods. This is evidence of shopper-country/payment-method coverage, NOT proof that an Algeria-based merchant can be onboarded or paid out.
- Public 2Sell price: 3.5% + USD 0.35 per successful sale.
- 2Subscribe: 4.5% + USD 0.45; not relevant to ordinary one-off physical-product checkout.
- Provider states an additional 2% may apply for shoppers outside the merchant's country; the country list and applicability to an Algeria-based merchant must be confirmed in writing.
- Payout methods listed: wire transfer, ACH, PayPal and Payoneer. Public FAQ says payout timing depends on the merchant agreement. Public materials do not confirm that an Algerian bank account is eligible for USD/EUR/GBP settlement, nor the wire fee, FX spread, minimum payout, reserve/holdback, refund/chargeback deductions, or the exact payout schedule for this merchant.
- The country selector's Algeria listing does not guarantee merchant approval. Written onboarding confirmation is required.
- Ask Verifone/2Checkout to confirm: Algeria-resident beneficial owner and Algeria-registered seller eligibility; physical dropshipping goods eligibility; required commercial/tax documents; supported payout destination and currency; all transaction/cross-border/FX/refund/chargeback/wire fees; reserve and payout schedule; prohibited products; whether 2Sell acts as merchant of record for the proposed model.

Official sources:
- https://www.2checkout.com/global-payments/
- https://www.2checkout.com/pricing/
- https://www.2checkout.com/merchant-support/faq/

### Payoneer Checkout — not suitable as an assumed direct solution
- Public Checkout page states that the specific Checkout service is provided by Stripe Inc. and/or affiliates exclusively to US and Hong Kong entities.
- The page's eligibility note says applicants must have or be willing to set up a Hong Kong entity and have monthly webstore volume above USD 20,000.
- No setup/monthly maintenance fees are advertised, but actual bundled payment/FX/payout pricing is quote/account dependent.
- Therefore it is not a practical direct checkout route for an Algeria-based individual without a qualifying entity and volume.
Official source: https://www.payoneer.com/checkout/

### Stripe — unavailable directly from Algeria
- Algeria is not on Stripe's supported account-country list.
- Opening in another country requires a genuine legal entity there, tax ID, physical address, phone, ID, working website and physical bank account in that country. Do not use a false address or nominee account.
Official sources:
- https://stripe.com/global
- https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country

### PayPal — do not select until settlement is confirmed
- PayPal's current developer payout-country table does not list Algeria among countries whose account holders can receive and withdraw payouts.
- Some PayPal country/business pages and fee pages surface Algeria-related entries, but that does not establish that an Algeria-based merchant can receive commercial checkout proceeds and withdraw them.
- Require written confirmation from PayPal for receiving commercial payments and withdrawal to an account/card legally held by the Algeria-based merchant before considering integration.
Official source: https://developer.paypal.com/payouts/supported-features

### Algerian domestic routes — not an international global checkout substitute
- BDL International E-commerce describes international card acceptance for eligible legal entities with a BDL account and merchant contract. Published price shown: 5% per transaction, DZD 65,000/month excluding tax for the e-commerce pack, and DZD 70,000 one-time registration excluding tax. This is a high-cost local-bank route and the same page says eligibility requires a legal entity and BDL account.
- SATIM describes merchant onboarding through an acquiring bank, GIE Monétique authorization and technical certification. This is a domestic CIB/Edahabia route, not a verified global settlement solution.
Official sources:
- https://www.bdl.dz/en/international-ecommerce/
- https://www.satim.dz/index.php/fr/services-cib/paiement-en-ligne

## Decision
No provider is yet verified as fully usable by NOVA under the currently known facts. Do not enable live payments.
2Checkout/Verifone is the best candidate to request formal onboarding terms for international physical-goods checkout, because its public country selector explicitly lists Algeria and it advertises worldwide sales and wire payouts. This is only a candidate, not a selected/approved processor.
Do not integrate Payoneer Checkout, Stripe, or PayPal as an Algeria-based merchant on assumptions.

## Technical preparation permitted now
- Keep a provider-neutral payment ledger and adapter boundary.
- Store money as integer minor units plus ISO currency.
- Use idempotency keys and unique provider event IDs.
- Verify webhook signatures against raw request bytes before processing.
- Make webhook handling idempotent and audit every status transition.
- Keep all provider credentials in server-side secret storage only.
- Never store card number/CVV.
- Keep checkout endpoint disabled until legal seller eligibility, payment approval, shipping rules, supplier integration and production security testing are complete.
- Do not process payments for classified listings.

## Release gates
1. Owner supplies or obtains valid seller/business documentation.
2. Provider confirms in writing that this seller and physical dropshipping model are accepted.
3. Provider confirms payout to an eligible account the seller legally owns, currency, minimum, schedule, fees, FX and reserves.
4. Legal/accounting review confirms export, foreign-currency receipt, invoicing, consumer protection, refunds and tax treatment in Algeria.
5. Provider sandbox integration, webhook signature tests, idempotency, refund and dispute tests pass.
6. Only then request explicit owner approval to enable live checkout.
