export function validateCard(card) {
  const errors = [];
  if (!card || typeof card !== "object") errors.push("card must be an object");
  if (card?.schema_version !== "1.0") errors.push("unsupported schema_version");
  if (card?.product !== "innsegall") errors.push("product must be innsegall");
  if (!card?.card_id) errors.push("missing card_id");
  if (!card?.verdict) errors.push("missing verdict");
  if (!Array.isArray(card?.checks_run)) errors.push("checks_run must be array");
  return errors;
}
