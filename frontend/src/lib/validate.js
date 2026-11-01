import { parseAmountMinor } from "./money.js"

const namePattern = /^[\p{L}][\p{L}\s.'-]*$/u
const currencies = ["USD", "EUR", "GBP", "AED", "SGD"]

export function validateOrder(values) {
  const fields = {}
  const rawName = values.customerName
  if (typeof rawName !== "string" || rawName.trim() === "") fields.customerName = "Customer name is required."
  else {
    const name = rawName.trim().replace(/\s+/g, " ")
    if (name.length < 2) fields.customerName = "Customer name must be at least 2 characters."
    else if (name.length > 100) fields.customerName = "Customer name must be 100 characters or fewer."
    else if (!namePattern.test(name)) fields.customerName = "Customer name can contain only letters, spaces, apostrophes, hyphens and full stops."
  }
  if (typeof values.currency !== "string" || values.currency.trim() === "") fields.currency = "Please select a currency."
  else if (!currencies.includes(values.currency.trim().toUpperCase())) fields.currency = "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD."
  const amount = parseAmountMinor(values.amount)
  if (!amount.ok) fields.amount = amount.error
  const firstField = ["customerName", "currency", "amount"].find((key) => fields[key])
  return { ok: !firstField, fields, error: firstField ? fields[firstField] : null, amountMinor: amount.ok ? amount.amountMinor : null }
}
