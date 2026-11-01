export function parseAmountMinor(value) {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return { ok: false, error: "Amount is required." }
  }
  if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "number" && !Number.isFinite(value))) {
    return { ok: false, error: "Amount must be a number." }
  }
  const text = typeof value === "number" ? String(value) : value.trim()
  if (text.startsWith("-")) return { ok: false, error: "Amount must be greater than 0." }
  if (!/^\d+(\.\d+)?$/.test(text)) return { ok: false, error: "Amount must be a plain number such as 100 or 100.50." }
  const [whole, fraction = ""] = text.split(".")
  if (fraction.length > 2) return { ok: false, error: "Amount can have at most 2 decimal places." }
  let wholeValue = 0
  for (const digit of whole) wholeValue = wholeValue * 10 + digit.charCodeAt(0) - 48
  const decimals = (fraction + "00").slice(0, 2)
  const amountMinor = wholeValue * 100 + (decimals.charCodeAt(0) - 48) * 10 + (decimals.charCodeAt(1) - 48)
  if (amountMinor === 0) return { ok: false, error: "Amount must be greater than 0." }
  if (amountMinor > 500000) return { ok: false, error: "Amount cannot exceed 5,000 units per order." }
  return { ok: true, amountMinor }
}

export function computeInrPaise(amountMinor, rate) {
  const rateMinor = Math.round(rate * 100)
  const product = amountMinor * rateMinor
  const shifted = product + 50
  return (shifted - (shifted % 100)) / 100
}

export function amountFromMinor(amountMinor) {
  return amountMinor / 100
}

export function inrFromPaise(paise) {
  return paise / 100
}
