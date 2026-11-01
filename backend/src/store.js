export function createStore() {
  const orders = []
  const idempotency = new Map()
  return {
    add(order) { orders.unshift(order) },
    list(currency) { return orders.filter((order) => !currency || order.currency === currency).slice() },
    hasId(id) { return orders.some((order) => order.id === id) },
    getByKey(key) { const id = idempotency.get(key); return orders.find((order) => order.id === id) },
    setKey(key, id) { idempotency.set(key, id) }
  }
}
