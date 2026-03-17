import cors, { CorsOptions } from "cors";
import { Application } from "express";

const whitelistEnvs = ["development", "stage", "test"];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (whitelistEnvs.includes(process.env.NODE_ENV)) {
      return callback(null, true);
    }

    const whitelist = (process.env.CORS_DOMAIN || "").split(",");

    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
};

export const enableCors = (app: Application): void => {
  app.use(cors(corsOptions));
  app.options("/*splat", cors());
};
