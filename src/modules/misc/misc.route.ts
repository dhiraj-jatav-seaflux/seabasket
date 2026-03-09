import { withRoutes } from "@helpers";
import { Router } from "express";
import { getEnums } from "./misc.controller";

const routes = (app: Router) => {
  app.get("/enums", getEnums);
};

export const miscRoutes = withRoutes(routes);
