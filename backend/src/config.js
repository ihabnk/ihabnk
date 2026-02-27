import { env } from "./config/env.js";

export const config = {
  port: env.PORT,
  googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
  corsOrigin: env.CLIENT_URL,
};
