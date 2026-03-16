import "reflect-metadata";
import { initializeDB } from "@db";
import {
  EnvSchema,
  enableCors,
  getLogger,
  handleUnhandledPromise,
} from "@helpers";
import { destructPager, errorHandler } from "@middlewares";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import methodOverride from "method-override";
import morgan from "morgan";
import { configureRoutes } from "./routes";
import cloudinary from "configs/cloudinary";


const logger = getLogger();

export const createServer = async (envs: EnvSchema) => {
  // init DB
  await initializeDB();

  // Handle Unhandled Promise Rejections
  handleUnhandledPromise();

  // Init Express
  const app = express();

  // Security
  enableCors(app);
  app.use(helmet());
  app.use(morgan("tiny"));
  app.use(compression());

  // Enable DELETE and PUT
  app.use(methodOverride());

  // Body Parsing
  app.use((req, res, next) => {
  if (req.originalUrl === "/orders/stripe/webhook") {
      return next(); // skip JSON parser for Stripe webhook
    }
    json({ limit: "50mb" })(req, res, next);
  });
  app.use(urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

  // Destruct Pager from query string and typecast to numbers
  app.use(destructPager);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Routing
  app.use("/", configureRoutes);

  // Centralized error handler (should be after all routes)
  app.use(errorHandler);

  // Start server
  app.listen(envs.port, () => {
    logger.info(`The server is running on port localhost: ${envs.port}`);
  });

  return app;
};
