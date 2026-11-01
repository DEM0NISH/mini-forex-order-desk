import { randomUUID } from "node:crypto"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import { config } from "./config.js"
import { rates } from "./rates.js"
import { validateOrderInput } from "./validation.js"
import { amountFromMinor, computeInrPaise, inrFromPaise } from "./money.js"

export function createApp({ store }) {
  const app = express()
  app.disable("x-powered-by")
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) callback(null, true)
      else callback(null, false)
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Idempotency-Key"]
  }))
  app.use(express.json({ limit: "10kb" }))
  app.get("/api/health", (request, response) => response.json({ status: "ok" }))
  app.get("/api/rates", (request, response) => response.json(rates))
  app.get("/api/orders", (request, response) => {
    const rawCurrency = request.query.currency
    if (rawCurrency === undefined) return response.json(store.list())
    const currency = String(rawCurrency).trim().toUpperCase()
    if (!rates.some((item) => item.currency === currency)) {
      return response.status(400).json({ error: "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD.", fields: { currency: "Currency is not supported. Supported currencies: USD, EUR, GBP, AED, SGD." } })
    }
    return response.json(store.list(currency))
  })
  app.post("/api/orders", (request, response) => {
    const validated = validateOrderInput(request.body ?? {})
    if (!validated.ok) return response.status(400).json({ error: validated.error, fields: validated.fields })
    const idempotencyKey = request.get("Idempotency-Key")
    if (idempotencyKey && /^[A-Za-z0-9_-]{8,64}$/.test(idempotencyKey)) {
      const existing = store.getByKey(idempotencyKey)
      if (existing) return response.status(200).json(existing)
    }
    const rate = rates.find((item) => item.currency === validated.value.currency).rate
    let id
    do { id = `FX-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}` } while (store.hasId(id))
    const order = {
      id,
      customerName: validated.value.customerName,
      currency: validated.value.currency,
      amount: amountFromMinor(validated.value.amountMinor),
      rate,
      inrTotal: inrFromPaise(computeInrPaise(validated.value.amountMinor, rate)),
      createdAt: new Date().toISOString()
    }
    store.add(order)
    if (idempotencyKey && /^[A-Za-z0-9_-]{8,64}$/.test(idempotencyKey)) store.setKey(idempotencyKey, id)
    return response.status(201).json(order)
  })
  app.use("/api", (request, response) => response.status(404).json({ error: "Route not found." }))
  app.use((request, response) => response.status(404).json({ error: "Route not found." }))
  app.use((error, request, response, next) => {
    if (error.type === "entity.parse.failed") return response.status(400).json({ error: "Request body is not valid JSON." })
    if (error.type === "entity.too.large") return response.status(413).json({ error: "Request body is too large." })
    return response.status(500).json({ error: "Something went wrong. Please try again." })
  })
  return app
}
