import { createApp } from "./app.js"
import { config } from "./config.js"
import { createStore } from "./store.js"

const app = createApp({ store: createStore() })
app.listen(config.port, () => process.stdout.write(`Mini Forex Order Desk API listening on port ${config.port}\n`))
