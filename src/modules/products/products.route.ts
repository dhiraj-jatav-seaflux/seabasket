import { withRoutes } from "@helpers";
import { acl, bodyValidator, destructPager } from "@middlewares";
import { Router } from "express";
import { addToCart, deleteCartItem, getCart, getCategories, getProduct, getProducts, updateCartItemQuantity } from "./products.controller";

const routes = (app: Router) => {
  app.get("/", destructPager, getProducts);
  app.get("/categories", getCategories);
  app.get('/cart',acl,getCart);
  app.post('/cart/:productId',acl,addToCart);
  app.delete('/cart/:productId',acl,deleteCartItem);
  app.put('/cart/:productId',acl,updateCartItemQuantity)
  app.get("/:productId", getProduct);
};

export const productRoutes = withRoutes(routes);