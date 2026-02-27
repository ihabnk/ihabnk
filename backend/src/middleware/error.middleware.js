import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Must have all 4 params so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (!err.isOperational) {
    console.error("UNHANDLED ERROR:", err);
  }

  const statusCode = err.statusCode || 500;
  const isProd = env.NODE_ENV === "production";

  res.status(statusCode).json({
    status: "error",
    message: err.isOperational ? err.message : "Internal server error",
    ...(isProd ? {} : { stack: err.stack }),
  });
}
