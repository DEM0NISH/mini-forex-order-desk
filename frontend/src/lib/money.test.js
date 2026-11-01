import test from "node:test"
import assert from "node:assert/strict"
import { computeInrPaise, parseAmountMinor } from "./money.js"

test("amount parser matches the server contract", () => {
  for (const value of ["12", "12.3", "12.30", " 7 ", 5000, "5000.00"]) assert.equal(parseAmountMinor(value).ok, true)
  const invalid = [[undefined, "Amount is required."], [null, "Amount is required."], ["", "Amount is required."], [" ", "Amount is required."], [true, "Amount must be a number."], [[], "Amount must be a number."], [{}, "Amount must be a number."], [NaN, "Amount must be a number."], ["-5", "Amount must be greater than 0."], ["abc", "Amount must be a plain number such as 100 or 100.50."], ["12abc", "Amount must be a plain number such as 100 or 100.50."], ["1e3", "Amount must be a plain number such as 100 or 100.50."], [".5", "Amount must be a plain number such as 100 or 100.50."], ["5.", "Amount must be a plain number such as 100 or 100.50."], ["0", "Amount must be greater than 0."], ["0.00", "Amount must be greater than 0."], ["0.001", "Amount can have at most 2 decimal places."], ["10.123", "Amount can have at most 2 decimal places."], ["5000.01", "Amount cannot exceed 5,000 units per order."]]
  for (const [value, error] of invalid) assert.equal(parseAmountMinor(value).error, error)
})

test("frontend uses the verified rounding vectors", () => {
  const vectors = [[10, 83.2, 83200], [5000, 83.2, 41600000], [12.34, 90.5, 111677], [0.01, 90.5, 91], [0.01, 105.8, 106], [0.5, 105.8, 5290], [0.1, 22.65, 227], [0.01, 22.65, 23], [3.33, 61.4, 20446], [0.01, 83.2, 83]]
  for (const [amount, rate, result] of vectors) assert.equal(computeInrPaise(Math.round(amount * 100), rate), result)
})
