import { env } from "./config/env.js";

export const config = {
  port: env.PORT,
  corsOrigin: env.CLIENT_URL,
};
