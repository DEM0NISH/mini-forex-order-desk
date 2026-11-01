import { parseAmountMinor } from "./money.js"
import { rates } from "./rates.js"

const allowedCurrencies = rates.map((item) => item.currency)
const namePattern = /^[\p{L}][\p{L}\s.'-]*$/u

export function validateOrderInput(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, fields: {}, error: "Request body must be a JSON object." }
  }
  const fields = {}
  let customerName
  let currency
  let amountMinor
  const rawName = body.customerName
  if (typeof rawName !== "string" || rawName.trim() === "") {
    fields.customerName = "Customer name is required."
  } else {
    customerName = rawName.trim().replace(/\s+/g, " ")
    if (customerName.length < 2) fields.customerName = "Customer name must be at least 2 characters."
    else if (customerName.length > 100) fields.customerName = "Customer name must be 100 characters or fewer."
    else if (!namePattern.test(customerName)) fields.customerName = "Customer name can contain only letters, spaces, apostrophes, hyphens and full stops."
  }
  if (typeof body.currency !== "string" || body.currency.trim() === "") {
    fields.currency = "Please select a currency."
  } else {
    currency = body.currency.trim().toUpperCase()
    if (!allowedCurrencies.includes(currency)) fields.currency = "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD."
  }
  const parsedAmount = parseAmountMinor(body.amount)
  if (!parsedAmount.ok) fields.amount = parsedAmount.error
  else amountMinor = parsedAmount.amountMinor
  const firstField = ["customerName", "currency", "amount"].find((key) => fields[key])
  return firstField
    ? { ok: false, fields, error: fields[firstField] }
    : { ok: true, fields: {}, error: null, value: { customerName, currency, amountMinor } }
}
