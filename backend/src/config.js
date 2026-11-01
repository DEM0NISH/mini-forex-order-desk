const parsedPort = Number.parseInt(process.env.PORT ?? "4000", 10)

export const config = {
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4000,
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}
