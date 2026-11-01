# Submission note

Mini Forex Order Desk provides a React customer flow backed by a Node.js and Express API. It includes fixed sample rates, client and server validation, integer-based INR rounding, order placement and confirmation, idempotent retry support, and filterable order history.

Optional enhancements implemented: currency filtering and idempotency keys. The backend suite passed 7 tests and the frontend suite passed 3 tests. The Vite production build succeeded. Live checks passed for health and rates, validation and exact rounding, idempotency, filtering, malformed and oversized requests, CORS, helmet headers, 50 unique IDs, ordering, and the Vite proxy. Both runtime dependency audits reported zero vulnerabilities. A fresh ZIP extraction passed both `npm ci` installs, both test suites, the frontend build, and backend health, rates, and valid POST checks.

The project uses Node.js, Express, cors, helmet, React, React DOM, Vite, and @vitejs/plugin-react. The AI tools disclosure is in README.md and must be reviewed and edited to reflect the candidate's actual use before submission.

Known limitations: rates are fixed assessment samples; orders are stored in memory and disappear after a backend restart; the required order history endpoint exposes all orders without authentication; orders are placed but not paid or delivered; there is no KYC, authentication, buy/sell spread, or payment flow; the units cap has differing value across currencies. College name is still the supplied placeholder `[NIITUniversity]` and must be confirmed.

UI interaction and responsive behaviour were not verified in a real browser; no screenshots were captured.
