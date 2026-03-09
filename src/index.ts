import { config } from "dotenv";

config({ path: ".env" });

import { envValidator, getLogger } from "@helpers";
import type { Express } from "express";
import { createServer } from "./server";

const logger = getLogger();

async function startServer(): Promise<Express> {
  try {
    // Validate env variables
    const envs = envValidator();

    // Start server with envs
    const server = await createServer(envs);
    logger.info("Server started successfully");
    return server;
  } catch (error) {
    logger.error("Failed to start server due to env validation error:", error);
    process.exit(1);
  }
}

startServer();
