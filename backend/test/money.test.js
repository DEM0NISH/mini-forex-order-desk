import test from "node:test"
import assert from "node:assert/strict"
import { computeInrPaise } from "../src/money.js"

test("money vectors round half-up using integer arithmetic", () => {
  const vectors = [[10, 83.2, 83200], [5000, 83.2, 41600000], [12.34, 90.5, 111677], [0.01, 90.5, 91], [0.01, 105.8, 106], [0.5, 105.8, 5290], [0.1, 22.65, 227], [0.01, 22.65, 23], [3.33, 61.4, 20446], [0.01, 83.2, 83]]
  for (const [amount, rate, paise] of vectors) assert.equal(computeInrPaise(Math.round(amount * 100), rate), paise)
})
