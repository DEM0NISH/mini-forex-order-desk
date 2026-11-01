import test from "node:test"
import assert from "node:assert/strict"
import { validateOrder } from "./validate.js"

test("client name and currency validation matches server messages", () => {
  assert.equal(validateOrder({ customerName: "  Asha   Rao  ", currency: "usd", amount: "10" }).ok, true)
  assert.equal(validateOrder({ customerName: "R2D2", currency: "XYZ", amount: "10" }).fields.customerName, "Customer name can contain only letters, spaces, apostrophes, hyphens and full stops.")
  assert.equal(validateOrder({ customerName: "Asha Rao", currency: "XYZ", amount: "10" }).fields.currency, "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD.")
  assert.equal(validateOrder({ customerName: "Asha Rao", amount: "10" }).fields.currency, "Please select a currency.")
  assert.equal(validateOrder({ customerName: "Asha Rao", currency: "USD", amount: "5000.01" }).fields.amount, "Amount cannot exceed 5,000 units per order.")
})
