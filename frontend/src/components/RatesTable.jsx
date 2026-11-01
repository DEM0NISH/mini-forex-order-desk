import { formatInr } from "../lib/format.js"

export default function RatesTable({ rates, loading, error, retry }) {
  return <section className="panel rates-panel" aria-labelledby="rates-heading">
    <div className="section-heading"><div><p className="eyebrow">TODAY'S DESK</p><h2 id="rates-heading">Fixed sample rates</h2></div>{error && <button className="quiet-button" onClick={retry}>Try again</button>}</div>
    <p className="notice">These are fixed sample rates for this assessment, not live market rates.</p>
    {loading ? <p role="status">Loading rates...</p> : error ? <p className="error-text" role="alert">{error}</p> : <div className="table-wrap"><table><caption className="sr-only">Sample foreign exchange rates in Indian rupees</caption><thead><tr><th scope="col">Currency</th><th scope="col">Name</th><th scope="col">Rate</th></tr></thead><tbody>{rates.map((item) => <tr key={item.currency}><td><strong>{item.currency}</strong></td><td>{item.name}</td><td>{formatInr(item.rate)}</td></tr>)}</tbody></table></div>}
  </section>
}
