import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`BeautyOnCall API listening on :${env.PORT}  [${env.NODE_ENV}]`);
});
