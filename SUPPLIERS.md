# NOVA MARKET — Supplier Network

This file is the internal supplier register for the NOVA MARKET worldwide dropshipping project.
It is project documentation, not a live supplier integration. Do not publish supplier credentials, API keys, customer data, or private account details in this repository.

## Approved supplier candidates

| Priority | Supplier / platform | Role in NOVA MARKET | Initial status | Official website |
|---|---|---|---|---|
| Primary | CJdropshipping | Main product sourcing, order fulfilment and international shipping candidate | Selected for evaluation; account/API not connected | https://cjdropshipping.com/ |
| Secondary | AliExpress via DSers | Alternative supplier marketplace and order-management workflow | Selected for evaluation; account/API not connected | https://www.aliexpress.com/ and https://www.dsers.com/ |
| Reserve | Zendrop | Additional sourcing and fulfilment option if product, destination and economics are better | Reserve candidate; account/API not connected | https://www.zendrop.com/ |

## Important operating rules

1. NOVA MARKET is intended to be the customer-facing seller: the customer places and pays for an order through NOVA MARKET.
2. NOVA MARKET must then pay the selected supplier and send only the order details required for fulfilment.
3. The supplier ships directly to the customer and returns tracking information.
4. Supplier availability, item price, shipping price, delivery estimate, destination coverage, taxes, customs duties, return terms and product compliance must be checked for every product and destination. “Worldwide” does not mean every item ships to every country.
5. Never publish a product until its supplier variant, total landed cost, stock status, delivery estimate and return route have been checked.
6. Never send customer personal data to a supplier until the checkout, privacy notice, lawful basis/consent, access controls and secure backend workflow are implemented.
7. Never store payment card details in NOVA MARKET. Use a compliant payment provider and its hosted/tokenized checkout.
8. Keep a manual review step for supplier payment, address errors, out-of-stock items, refunds, failed orders and delivery exceptions.

## Integration status

- [ ] Confirm the legal business entity and countries NOVA MARKET can sell to.
- [ ] Choose a payment provider that supports the business entity and target countries.
- [ ] Build a secure backend/API; GitHub Pages alone is static hosting and cannot securely process payments, protect API secrets, or handle customer orders.
- [ ] Create supplier accounts and review each supplier's current terms, supported destinations, return process and API access.
- [ ] Connect supplier APIs using server-side secrets only (never in browser JavaScript or public Git files).
- [ ] Build product/variant mapping and per-destination shipping-cost checks.
- [ ] Build checkout, order management, supplier fulfilment, tracking, cancellation and refund workflows.
- [ ] Update the Privacy Notice, Terms of Use, shipping policy, returns/refunds policy and seller-of-record disclosures before accepting live orders.
- [ ] Test a complete order and refund in a permitted test environment before launch.

## Recommended connection order

1. Evaluate CJdropshipping first as the primary candidate.
2. Evaluate AliExpress + DSers as the alternative supplier workflow.
3. Keep Zendrop as a reserve option; only connect it if its product and destination-level shipping economics outperform the other options.

## Do not treat these candidates as live integrations

The suppliers above have been added to the NOVA MARKET project register only. No supplier account, API connection, product import, payment gateway, shipping contract, or live fulfilment workflow has been configured yet.
