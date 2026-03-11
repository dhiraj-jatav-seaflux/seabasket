import { withRoutes } from "@helpers";
import { destructPager } from "@middlewares";
import { Router } from "express";
import { getCategories, getProduct, getProducts } from "./products.controller";

const routes = (app: Router) => {
  app.get("/", destructPager, getProducts);
  app.get("/categories", getCategories);
  app.get("/:productId", getProduct);
};

export const productRoutes = withRoutes(routes);
