/**
 * NOVA MARKET payment-provider boundary.
 *
 * No provider is enabled until NOVA has written merchant approval,
 * verified settlement to an eligible bank account, and completed legal review.
 * This module intentionally cannot create a live checkout session yet.
 */
const enabled = process.env.NOVA_PAYMENTS_ENABLED === 'true';
const providerCode = (process.env.NOVA_PAYMENT_PROVIDER || '').trim();

export function paymentReadiness() {
  return {
    enabled: false,
    configuredProvider: providerCode || null,
    livePaymentsAllowed: false,
    reason: enabled
      ? 'Provider integration is not implemented or approved.'
      : 'Payments remain disabled pending merchant approval and settlement verification.'
  };
}

export function assertLivePaymentsDisabled() {
  // Fail closed even if an environment flag is accidentally enabled.
  const error = new Error('Live payments are disabled until provider approval and integration tests are complete.');
  error.code = 'PAYMENTS_DISABLED';
  throw error;
}
