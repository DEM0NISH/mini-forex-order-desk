import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import RatesTable from "./components/RatesTable.jsx"
import OrderForm from "./components/OrderForm.jsx"
import OrderConfirmation from "./components/OrderConfirmation.jsx"
import OrderHistory from "./components/OrderHistory.jsx"
import { request } from "./lib/api.js"
import { computeInrPaise } from "./lib/money.js"
import { validateOrder } from "./lib/validate.js"

const emptyValues = { customerName: "", currency: "", amount: "" }
const networkMessage = "Could not reach the server. Your order was not confirmed. Please check your connection and try again."

export default function App() {
  const [rates, setRates] = useState([])
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState("")
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [historyCurrency, setHistoryCurrency] = useState("")
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const inFlight = useRef(false)
  const idempotencyKey = useRef(null)
  const confirmationRef = useRef(null)
  const touched = useRef(new Set())

  const loadRates = useCallback(async () => {
    setRatesLoading(true)
    setRatesError("")
    try { setRates(await request("/api/rates")) } catch { setRatesError("Rates could not be loaded. Please try again.") } finally { setRatesLoading(false) }
  }, [])

  const loadOrders = useCallback(async (filter = historyCurrency) => {
    setOrdersLoading(true)
    setOrdersError("")
    try { setOrders(await request(`/api/orders${filter ? `?currency=${encodeURIComponent(filter)}` : ""}`)) } catch { setOrdersError("Order history could not be loaded. Please try again.") } finally { setOrdersLoading(false) }
  }, [historyCurrency])

  useEffect(() => { loadRates() }, [])
  useEffect(() => { loadOrders(historyCurrency) }, [historyCurrency, loadOrders])
  useEffect(() => { if (confirmation) confirmationRef.current?.focus() }, [confirmation])

  const preview = useMemo(() => {
    const result = validateOrder(values)
    const rate = rates.find((item) => item.currency === values.currency)
    if (!result.ok || !rate) return null
    return { amount: result.amountMinor / 100, currency: rate.currency, rate: rate.rate, total: computeInrPaise(result.amountMinor, rate.rate) / 100 }
  }, [values, rates])

  function updateErrors(nextValues) {
    const validation = validateOrder(nextValues)
    const nextErrors = {}
    for (const key of touched.current) if (validation.fields[key]) nextErrors[key] = validation.fields[key]
    setErrors(nextErrors)
  }

  function onChange(event) {
    const next = { ...values, [event.target.name]: event.target.value }
    setValues(next)
    updateErrors(next)
    setAlert("")
  }

  function onBlur(event) {
    touched.current.add(event.target.name)
    const validation = validateOrder(values)
    setErrors((current) => ({ ...current, [event.target.name]: validation.fields[event.target.name] || "" }))
  }

  async function submit(event) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    const validation = validateOrder(values)
    touched.current = new Set(["customerName", "currency", "amount"])
    setErrors(validation.fields)
    setAlert("")
    if (!validation.ok) { inFlight.current = false; return }
    setIsSubmitting(true)
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    try {
      const order = await request("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current }, body: JSON.stringify({ customerName: values.customerName, currency: values.currency, amount: values.amount.trim() }), signal: controller.signal })
      idempotencyKey.current = null
      setConfirmation(order)
      setValues(emptyValues)
      setErrors({})
      touched.current = new Set()
      await loadOrders(historyCurrency)
    } catch (error) {
      if (error.status === 400) { idempotencyKey.current = null; setErrors(error.fields); setAlert(error.fields && Object.keys(error.fields).length ? "Please correct the highlighted fields." : error.message) }
      else if (error.status) setAlert(error.message)
      else setAlert(networkMessage)
    } finally {
      window.clearTimeout(timeout)
      inFlight.current = false
      setIsSubmitting(false)
    }
  }

  function startAnother() {
    setConfirmation(null)
    setValues(emptyValues)
    setErrors({})
    setAlert("")
    document.getElementById("customerName")?.focus()
  }

  return <div className="app-shell">
    <header className="site-header"><div className="header-inner"><div className="brand-mark" aria-hidden="true">FX</div><div><p className="eyebrow">EBIXCASH WORLD MONEY</p><h1>Mini Forex Order Desk</h1></div><span className="header-badge">Assessment demo</span></div></header>
    <main className="page-content">
      <div className="intro"><p className="eyebrow">A simpler way to plan your currency order</p><h2>Know your estimate before you place.</h2><p>Choose a currency, enter an amount, and review the INR estimate. Your order is placed using the fixed sample rate shown below.</p></div>
      <RatesTable rates={rates} loading={ratesLoading} error={ratesError} retry={loadRates} />
      <div className="order-layout"><OrderForm rates={rates} values={values} errors={errors} onChange={onChange} onBlur={onBlur} onSubmit={submit} isSubmitting={isSubmitting} preview={preview} alert={alert} /><OrderConfirmation order={confirmation} onAnother={startAnother} ref={confirmationRef} /></div>
      <OrderHistory orders={orders} loading={ordersLoading} error={ordersError} currency={historyCurrency} onCurrencyChange={setHistoryCurrency} refresh={() => loadOrders(historyCurrency)} />
      <p className="footer-note">Orders are recorded as placed. Payment and delivery are not part of this assessment flow.</p>
    </main>
  </div>
}
