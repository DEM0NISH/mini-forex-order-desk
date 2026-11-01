import { forwardRef } from "react"
import { formatDate, formatForeign, formatInr } from "../lib/format.js"

const OrderConfirmation = forwardRef(function OrderConfirmation({ order, onAnother }, ref) {
  if (!order) return null
  return <section className="panel confirmation" aria-labelledby="confirmation-heading" aria-live="polite" tabIndex="-1" ref={ref}>
    <p className="eyebrow">ORDER PLACED</p><h2 id="confirmation-heading">Your order is confirmed</h2><p className="reference">Reference <strong>{order.id}</strong></p>
    <dl><div><dt>Customer</dt><dd>{order.customerName}</dd></div><div><dt>Currency</dt><dd>{formatForeign(order.amount)} {order.currency}</dd></div><div><dt>Rate used</dt><dd>1 {order.currency} = {formatInr(order.rate)}</dd></div><div><dt>Estimated total</dt><dd>{formatInr(order.inrTotal)}</dd></div><div><dt>Placed</dt><dd>{formatDate(order.createdAt)}</dd></div></dl>
    <button className="quiet-button" onClick={onAnother}>Place another order</button>
  </section>
})

export default OrderConfirmation
