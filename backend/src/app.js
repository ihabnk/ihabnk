import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// General rate limit — 100 requests per 15-minute window
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please try again later." },
});
app.use(generalLimiter);

// Auth rate limit — 5 requests per 15-minute window (exported for auth routes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many attempts, please try again later." },
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---- Future route mounts go here (between health and error handler) ----

// Global error handler — must be the last middleware
app.use(errorHandler);

export default app;
