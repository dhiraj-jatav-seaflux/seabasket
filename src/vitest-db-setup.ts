// vitest-db-setup.ts
import { config } from "dotenv";

config({ path: ".env.test" }); // Load test env early

import { envValidator } from "@helpers";
import { createServer } from "./server";

export async function getTestApp() {
  const envs = envValidator();
  const app = await createServer(envs); // if createServer is async
  return app;
}
