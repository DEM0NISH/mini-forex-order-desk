import test from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { createApp } from "../src/app.js"
import { createStore } from "../src/store.js"

async function withServer(run) {
  const server = createServer(createApp({ store: createStore() }))
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  try { await run(`http://127.0.0.1:${address.port}`) } finally { await new Promise((resolve) => server.close(resolve)) }
}

test("API serves rates, accepts orders, filters and replays idempotently", async () => {
  await withServer(async (base) => {
    const rates = await fetch(`${base}/api/rates`).then((response) => response.json())
    assert.equal(rates.length, 5)
    assert.equal(rates[0].rate, 83.2)
    const created = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "test-key-123" }, body: JSON.stringify({ customerName: "  Asha   Rao ", currency: "usd", amount: "10.00", inrTotal: 1 }) })
    const order = await created.json()
    assert.equal(created.status, 201)
    assert.match(order.id, /^FX-[0-9A-F]{8}$/)
    assert.equal(order.customerName, "Asha Rao")
    assert.equal(order.inrTotal, 832)
    assert.match(order.createdAt, /^\d{4}-\d\d-\d\dT/)
    const replay = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "test-key-123" }, body: JSON.stringify({ customerName: "Asha Rao", currency: "USD", amount: 10 }) })
    assert.equal(replay.status, 200)
    assert.deepEqual(await replay.json(), order)
    assert.equal((await fetch(`${base}/api/orders?currency=usd`)).status, 200)
    assert.equal((await fetch(`${base}/api/orders?currency=XYZ`)).status, 400)
    const all = await fetch(`${base}/api/orders`).then((response) => response.json())
    assert.equal(all.length, 1)
    assert.equal(all[0].inrTotal, all[0].amount * all[0].rate)
  })
})

test("API validation, malformed JSON, size limit, unknown route and headers", async () => {
  await withServer(async (base) => {
    const invalid = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: "<script>x</script>", currency: "USD", amount: "5000.01" }) })
    assert.equal(invalid.status, 400)
    assert.deepEqual(Object.keys((await invalid.json()).fields), ["customerName", "amount"])
    const cap = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: "Asha Rao", currency: "USD", amount: 5000 }) })
    assert.equal(cap.status, 201)
    const malformed = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })
    assert.equal(malformed.status, 400)
    assert.deepEqual(await malformed.json(), { error: "Request body is not valid JSON." })
    const array = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "[]" })
    assert.equal(array.status, 400)
    const noContentType = await fetch(`${base}/api/orders`, { method: "POST", body: "ignored" })
    assert.equal(noContentType.status, 400)
    assert.equal((await noContentType.json()).fields.customerName, "Customer name is required.")
    const large = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: "x".repeat(20000) }) })
    assert.equal(large.status, 413)
    const missing = await fetch(`${base}/api/not-real`)
    assert.equal(missing.status, 404)
    assert.deepEqual(await missing.json(), { error: "Route not found." })
    assert.ok(missing.headers.get("content-security-policy"))
    assert.equal(missing.headers.get("x-powered-by"), null)
  })
})
