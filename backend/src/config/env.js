import dotenv from "dotenv";
dotenv.config();

const requiredKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "STRIPE_SECRET_KEY",
  "AWS_ACCESS_KEY",
  "AWS_SECRET_KEY",
  "AWS_BUCKET_NAME",
  "CLIENT_URL",
];

const missing = requiredKeys.filter((k) => !process.env[k]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
      "Copy .env.example → .env and fill in every value."
  );
}

export const env = Object.freeze({
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,

  CLIENT_URL: process.env.CLIENT_URL,

  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
});
