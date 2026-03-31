import { withRoutes } from "@helpers";
import { acl, destructPager } from "@middlewares";
import { Router } from "express";
import { getCategories, getProduct, getProducts } from "./products.controller";
import { reviewRoutes } from "./reviews";

const routes = (app: Router) => {
  app.get("/", destructPager, getProducts);
  app.get("/categories", getCategories);
  app.use('/review',reviewRoutes);
  app.get("/:productId", getProduct);
};

export const productRoutes = withRoutes(routes);