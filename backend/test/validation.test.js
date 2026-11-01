import test from "node:test"
import assert from "node:assert/strict"
import { validateOrderInput } from "../src/validation.js"
import { parseAmountMinor } from "../src/money.js"

test("amount parsing accepts valid decimal inputs", () => {
  for (const value of ["12", "12.3", "12.30", " 7 ", 5000, "5000.00"]) assert.equal(parseAmountMinor(value).ok, true)
  assert.equal(parseAmountMinor("12.3").amountMinor, 1230)
})

test("amount parsing rejects invalid values with exact messages", () => {
  const cases = [
    [undefined, "Amount is required."], [null, "Amount is required."], ["", "Amount is required."], [" ", "Amount is required."],
    [true, "Amount must be a number."], [[], "Amount must be a number."], [{}, "Amount must be a number."], [NaN, "Amount must be a number."],
    ["-5", "Amount must be greater than 0."], ["abc", "Amount must be a plain number such as 100 or 100.50."],
    ["12abc", "Amount must be a plain number such as 100 or 100.50."], ["1e3", "Amount must be a plain number such as 100 or 100.50."],
    [".5", "Amount must be a plain number such as 100 or 100.50."], ["5.", "Amount must be a plain number such as 100 or 100.50."],
    ["0", "Amount must be greater than 0."], ["0.00", "Amount must be greater than 0."], ["0.001", "Amount can have at most 2 decimal places."],
    ["10.123", "Amount can have at most 2 decimal places."], ["5000.01", "Amount cannot exceed 5,000 units per order."]
  ]
  for (const [value, error] of cases) assert.equal(parseAmountMinor(value).error, error)
})

test("names normalize and reject invalid input", () => {
  assert.equal(validateOrderInput({ customerName: "  Asha   Rao  ", currency: "usd", amount: 1 }).value.customerName, "Asha Rao")
  for (const name of ["Asha Rao", "Jose D'Souza-Rao", "Élodie Martin"]) assert.equal(validateOrderInput({ customerName: name, currency: "USD", amount: 1 }).ok, true)
  for (const name of ["", "   ", "A", "R2D2", "<script>alert(1)</script>", "x".repeat(101)]) assert.equal(validateOrderInput({ customerName: name, currency: "USD", amount: 1 }).ok, false)
  assert.equal(validateOrderInput({ customerName: "A", currency: "XYZ", amount: "abc" }).error, "Customer name must be at least 2 characters.")
})

test("currency is normalized and allow-listed", () => {
  assert.equal(validateOrderInput({ customerName: "A B", currency: " eur ", amount: 1 }).value.currency, "EUR")
  assert.equal(validateOrderInput({ customerName: "A B", currency: "XYZ", amount: 1 }).fields.currency, "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD.")
  assert.equal(validateOrderInput({ customerName: "A B", amount: 1 }).fields.currency, "Please select a currency.")
  assert.equal(validateOrderInput({ customerName: "A B", currency: "", amount: 1 }).fields.currency, "Please select a currency.")
})
