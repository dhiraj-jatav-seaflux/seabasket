import cors, { CorsOptions } from "cors";
import { Application } from "express";

const whitelistEnvs = ["development", "stage", "test"];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // by pass check
    if (whitelistEnvs.includes(process.env.NODE_ENV)) {
      callback(null, true);
    } else {
      const whitelist = process.env.CORS_DOMAIN.split(",");
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
};

export const enableCors = (app: Application): void => {
  app.use(cors(corsOptions));
  app.options("/*splat", cors());
};
