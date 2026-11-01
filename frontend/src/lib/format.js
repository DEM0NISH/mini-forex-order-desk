const inrFormatter = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatInr(value) {
  return `₹${inrFormatter.format(value)}`
}

export function formatForeign(value) {
  return Number(value).toFixed(2)
}

export function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}
