import dotenv from "dotenv";

dotenv.config();

const port = Number.parseInt(process.env.PORT ?? "8080", 10);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

export const config = {
  port,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "*"
};
