const base = import.meta.env.VITE_API_BASE_URL ?? ""

export async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, options)
  const payload = await response.json()
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed.")
    error.fields = payload.fields || {}
    error.status = response.status
    throw error
  }
  return payload
}
