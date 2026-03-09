import { Constants } from "@configs";
import { z } from "zod";
import { getLogger } from "./logger.helper";

const logger = getLogger();

const envSchema = z.object({
  port: z.number().int().max(9999),
  dbName: z.string().min(1),
  dbHost: z.string().min(1),
  dbUser: z.string().min(1),
  dbPort: z.number().int().max(9999),
  dbPassword: z.string().min(1),
  // dbSchema: z.string().min(1),
  nodeEnv: z
    .string()
    .min(1)
    .refine(value => Constants.ENVIRONMENTS.includes(value)),
});

// ✅ Define the type
export type EnvSchema = z.infer<typeof envSchema>;

export function envValidator(): EnvSchema {
  const result = envSchema.safeParse({
    port: +process.env.PORT!,
    dbName: process.env.DB_NAME!,
    dbHost: process.env.DB_HOST!,
    dbUser: process.env.DB_USER!,
    dbPort: +process.env.DB_PORT!,
    dbPassword: process.env.DB_PASSWORD!,
    // dbSchema: process.env.DB_SCHEMA!,
    nodeEnv: process.env.NODE_ENV!,
  });

  if (result.success) {
    logger.info("ENV file validated");
    return result.data;
  }

  const errors = result.error.format();
  logger.error("ENV file is invalid", errors);
  throw new Error("ENV file is invalid");
}
