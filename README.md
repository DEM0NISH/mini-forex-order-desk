# Mini Forex Order Desk

## 1. Project overview and customer journey

Mini Forex Order Desk is a small customer-facing foreign-currency order flow for a Full Stack Developer Intern practical assessment. A customer reviews fixed sample rates in INR, enters a name, currency, and amount, sees a rounded estimate before submitting, receives a placed-order reference, and can review or filter previous orders.

## 2. Tech stack and prerequisites

- Backend: Node.js >= 20, Express 4, cors, helmet
- Frontend: React 18, React DOM 18, Vite 5, @vitejs/plugin-react 4, JavaScript and CSS
- Prerequisites: Node.js >= 20 and npm

## 3. Installation and running

Use two terminals from this folder. On Windows, macOS, or Linux:

Backend terminal:

```text
cd backend
npm install
npm start
```

Frontend terminal:

```text
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite development server forwards `/api` requests to the backend at port 4000.

Run backend tests with `cd backend` then `npm test`. Run frontend library tests with `cd frontend` then `npm test`. Build the frontend with `cd frontend` then `npm run build`.

Optional environment variables: backend `PORT` (defaults to 4000) and `CORS_ORIGIN` (comma-separated allowed browser origins); frontend `VITE_API_BASE_URL` (empty uses the Vite proxy). Copy the relevant `.env.example` to `.env` to set values. Node 20.6+ can load an environment file with `node --env-file=.env src/server.js`; `npm start` does not automatically load `.env`.

## 4. Folder structure

```text
FullStackTest/
  README.md
  SUBMISSION_NOTE.md
  .gitignore
  backend/
    package.json
    package-lock.json
    .env.example
    src/
    test/
  frontend/
    package.json
    package-lock.json
    .env.example
    index.html
    vite.config.js
    src/
  docs/screenshots/ (only when real screenshots are available)
```

## 5. API reference

All endpoints return JSON.

### `GET /api/health`

Returns `200 { "status": "ok" }`.

### `GET /api/rates`

Returns a plain array of the five fixed sample rates, each with `currency`, `name`, and `rate` (INR per unit).

### `GET /api/orders`

Returns all orders newest first. Optional `?currency=USD` filters case-insensitively after trimming. Supported values are USD, EUR, GBP, AED, and SGD. A supported currency with no orders returns `[]`.

### `POST /api/orders`

Request example:

```json
{"customerName":"Asha Rao","currency":"USD","amount":"12.34"}
```

Success returns `201` and the stored order, for example:

```json
{"id":"FX-3F9A1C2B","customerName":"Asha Rao","currency":"USD","amount":12.34,"rate":83.2,"inrTotal":1026.69,"createdAt":"2026-11-01T10:15:30.123Z"}
```

An optional `Idempotency-Key` header accepts 8 to 64 letters, digits, underscores, or hyphens. Replaying a valid key returns the original order with status `200`.

Validation failures return `400 { "error": "...", "fields": { "field": "..." } }`. The first `error` message follows customer name, currency, amount order, while `fields` includes every invalid field. Malformed JSON returns `400 { "error": "Request body is not valid JSON." }`; oversized JSON returns `413 { "error": "Request body is too large." }`; unknown routes return `404 { "error": "Route not found." }`. Unexpected failures return a generic `500` message without internal details.

| Field | Rules |
| --- | --- |
| Customer name | Trimmed; internal whitespace collapsed; 2–100 characters; Unicode letters, spaces, apostrophes, hyphens, and full stops |
| Currency | Trimmed, uppercased, and limited to USD, EUR, GBP, AED, SGD |
| Amount | Number or plain decimal string; positive; maximum 5,000; no more than 2 decimal places |

## 6. Assumptions and Decisions

- D1: Rates are fixed assessment sample data and are labelled as not live market rates.
- D2: Customer names are trimmed, whitespace-normalized, 2–100 characters, and checked against the specified Unicode letter pattern.
- D3: Currency is trimmed and uppercased on the server, then checked against the five supported currencies.
- D4: Amounts accept JSON numbers or plain decimal strings, are limited to two decimal places, and must be greater than 0 and at most 5,000 units.
- D5: INR totals use integer arithmetic and half-up rounding to two decimal places.
- D6: There are no fees. Total equals amount multiplied by rate.
- D7: Orders are placed, not paid. Payment, delivery, cancellation, KYC, and authentication are out of scope.
- D8: Orders are held in memory and disappear when the server restarts.
- D9: The required unauthenticated history endpoint returns every order; this is a production privacy limitation.
- Rates are captured on each order so a later rate change cannot rewrite the estimate used for an existing order.
- The enrollment number and candidate name come from the supplied brief. The college value `[NIITUniversity]` remains a visible placeholder and must be confirmed before submission.

## 7. Edge cases handled

The backend checks the JSON body shape, all field rules, decimal precision, zero and negative amounts, scientific notation, over-limit amounts, unsupported currencies, malformed JSON, oversized bodies, unknown routes, and invalid idempotency keys. The frontend validates as the user interacts, presents field-specific feedback, preserves values when a request fails, guards synchronous repeat submits, reuses an idempotency key after network failures, and avoids displaying invalid numeric estimates.

## 8. Section D: design and production considerations

### Local to production

Build the frontend with `npm run build` in `frontend`, then deploy its static output to a host such as Vercel or Netlify. Deploy the Node service to a Node host such as Render or Railway with `npm start`. Set `PORT` and a production `CORS_ORIGIN` on the backend, and set `VITE_API_BASE_URL` to the deployed API origin when the frontend and API use different origins. Use HTTPS on both. Keep the CORS allow-list limited to the deployed frontend. The `/api/health` endpoint can be used as a basic service health check.

### Data structures

A production design could store customers (`id`, `name`, `email`, `phone`, KYC fields), orders (`id`, `customer_id`, `currency`, `amount`, `rate_used`, `inr_total`, `status`, `created_at`), and rates (`currency`, `rate`, `updated_at`). An order references its customer; one customer can have many orders. `rate_used` preserves the quoted calculation even when current rates change. This assessment uses an in-memory array and map to keep the example readable. A file offers simple persistence but creates concurrency and recovery concerns. PostgreSQL is a stronger production fit for relationships, constraints, transactions, and querying. Friendly order IDs are derived from `crypto.randomUUID()` and checked for uniqueness; timestamps use ISO UTC from `Date`.

### Form and data flow

The browser collects the three fields and provides immediate validation and an estimate. It sends the name, currency, and decimal amount to the API. The server validates again, normalizes the inputs, chooses its own rate, computes the total in integer minor units, stores the order, and returns its record. The UI clears the form only after success, moves focus to the confirmation, and refreshes history without reloading. Incomplete or invalid input gets field messages. Failed requests and timeouts retain the entered values. The submit button is disabled during the request, a synchronous in-flight guard blocks rapid duplicate events, and an idempotency key makes safe retries possible.

### Basic security controls

The service validates inputs server-side, limits JSON bodies to 10kb, uses helmet security headers and a configurable CORS allow-list, contains no secrets in source, renders customer text through React's normal text handling, and omits stack traces from error responses. A production service should add authentication and per-customer access, rate limiting, audit logs, KYC/compliance processes, and rate quotes with an expiry.

### Known limitations

Following D7, the flow has no payment, delivery, or cancellation step, KYC, or authentication. Following D8, in-memory orders are lost on server restart. Following D9, anyone can read all orders through the required endpoint, so it is not suitable for production as-is. The unit-based 5,000 cap has uneven value across currencies. Rates have no buy/sell spread, and there is no payment step.

## 9. Tests performed

This table must be completed from the final actual verification run. A scenario is not marked successful unless the command was run and its result was observed.

| Scenario | Expected | Actual result |
| --- | --- | --- |
| Backend automated suite | `npm test` passes | 7 tests passed, 0 failed |
| Frontend automated suite | `npm test` passes | 3 tests passed, 0 failed |
| Frontend production build | `npm run build` succeeds | Vite 5.4.21 build succeeded |
| Health and rates endpoints | 200 JSON; five sample rates | Passed: 200 for both |
| Valid order and server total | 201; AED 0.10 rounds to ₹2.27 | Passed: 201 and ₹2.27 |
| Validation and amount cap | Invalid fields 400; 5,000 accepted | Passed: 400 and 201 |
| Malformed JSON, array body, oversized body, unknown route | 400, 400, 413, 404 JSON | Passed with the expected statuses and bodies |
| Filter and idempotency | Supported filter 200; invalid filter 400; replay 200 | Passed |
| CORS and security headers | Disallowed origin has no ACAO; helmet header present | Passed; `x-powered-by` absent |
| Vite proxy POST | API order succeeds through port 5173 | Passed: 201 with EUR 12.34 total ₹1,116.77 |
| 50-order ID and ordering check | Unique IDs; newest order first | Passed: 50 unique IDs, newest amount 50 |
| Runtime dependency audit | `npm audit --omit=dev` in each package | Both reported 0 vulnerabilities |
| Clean install from extracted ZIP | Both `npm ci` and suites pass | Passed: both installs, backend 7/7, frontend 3/3, and frontend build succeeded |
| Extracted backend smoke check | Health, rates, and valid POST work | Passed: health 200, five rates, POST 201 with total 832 |
| No-comments and secret scan | No code comments, `.env`, or embedded secret values | Passed: 27 source/config files scanned, 0 `.env` files, no secret-pattern matches |
| UI interaction and responsive behaviour | Verified in browser at 375, 768, 1280px | UI interaction and responsive behaviour were not verified in a real browser; no browser automation package or browser executable was available |

The live checks used the real Express and Vite development servers. The final archive was extracted to a fresh directory; both `npm ci` installs, the backend suite (7/7), frontend suite (3/3), frontend build, and backend health, rates, and valid POST checks passed. The dependency audit was limited to runtime dependencies as requested. The frontend installation reported two vulnerabilities across its full dependency tree; `npm audit --omit=dev` reported zero runtime vulnerabilities. UI interaction and responsive behaviour were not verified in a real browser; no screenshots were captured.

## 10. Completed requirements checklist

- Core: rates, customer form, preview, server validation, exact total calculation, order placement, confirmation, and order history are implemented.
- Core: error handling, fixed-rate notice, no-fee statement, responsive CSS, semantic tables, and accessible form labels are implemented.
- Optional E1: currency history filter is implemented.
- Optional E2: idempotency header support and client retry-key reuse are implemented.
- Optional E3: backend and frontend automated test files are included; execution results are reported only after they run.

## 11. AI tools and external resources disclosure

An AI coding agent generated this code from a detailed project prompt. Libraries used: Express handles backend routing; cors applies cross-origin rules; helmet sets security headers; React and React DOM render the interface; Vite serves and builds the frontend; @vitejs/plugin-react enables React support in Vite. No templates or other candidates' work were used. Edit this section so it truthfully describes your own use of AI before submitting.
