import { useEffect, useRef } from "react"
import { formatForeign, formatInr } from "../lib/format.js"

export default function OrderForm({ rates, values, errors, onChange, onBlur, onSubmit, isSubmitting, preview, alert }) {
  const nameRef = useRef(null)
  const currencyRef = useRef(null)
  const amountRef = useRef(null)
  useEffect(() => {
    const first = [nameRef, currencyRef, amountRef].find((ref) => errors[ref === nameRef ? "customerName" : ref === currencyRef ? "currency" : "amount"])
    if (first) first.current?.focus()
  }, [errors])
  return <section className="panel form-panel" aria-labelledby="order-heading">
    <p className="eyebrow">START AN ORDER</p><h2 id="order-heading">Order foreign currency</h2>
    {alert && <p className="alert" role="alert">{alert}</p>}
    <form onSubmit={onSubmit} noValidate>
      <div className="field"><label htmlFor="customerName">Customer name</label><input ref={nameRef} id="customerName" name="customerName" value={values.customerName} onChange={onChange} onBlur={onBlur} placeholder="e.g. Asha Rao" autoComplete="name" aria-invalid={Boolean(errors.customerName)} aria-describedby={errors.customerName ? "customerName-error" : undefined} />{errors.customerName && <span className="field-error" id="customerName-error" role="alert">{errors.customerName}</span>}</div>
      <div className="field"><label htmlFor="currency">Currency</label><select ref={currencyRef} id="currency" name="currency" value={values.currency} onChange={onChange} onBlur={onBlur} aria-invalid={Boolean(errors.currency)} aria-describedby={errors.currency ? "currency-error" : undefined}><option value="">Select currency</option>{rates.map((rate) => <option value={rate.currency} key={rate.currency}>{rate.currency} — {rate.name}</option>)}</select>{errors.currency && <span className="field-error" id="currency-error" role="alert">{errors.currency}</span>}</div>
      <div className="field"><label htmlFor="amount">Amount</label><div className="amount-input"><input ref={amountRef} id="amount" name="amount" type="text" inputMode="decimal" value={values.amount} onChange={onChange} onBlur={onBlur} placeholder="e.g. 250.00" aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? "amount-error" : "amount-help amount-error"} /><span>{values.currency || "Units"}</span></div><span className="field-help" id="amount-help">Maximum 5,000 units per order.</span>{errors.amount && <span className="field-error" id="amount-error" role="alert">{errors.amount}</span>}</div>
      <div className="preview" aria-live="polite"><strong>{preview ? `Estimated payable: ${formatInr(preview.total)} (${formatForeign(preview.amount)} x ${formatForeign(preview.rate)}, 1 ${preview.currency} = ${formatInr(preview.rate)})` : "Enter a valid amount and currency to see the estimate."}</strong><span>No fees are added. Total = amount x rate.</span></div>
      <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Placing order..." : "Place order"}</button>
    </form>
  </section>
}
