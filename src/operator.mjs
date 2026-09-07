/**
 * Operator-only dev bypasses · never enable in distributed CLI builds.
 * Credits and clan plan unlock only via signed license.json from Stripe.
 */
export function isOperatorMode() {
  return process.env.INNSEGALL_OPERATOR === "1";
}

export function requireOperator(action) {
  if (isOperatorMode()) return null;
  return `${action} is operator-only. Pay at innsegall.com → import license with innsegall plan --import-license.`;
}
