import { withRoutes } from "@helpers";
import { acl } from "@middlewares";
import { Router } from "express";
import { addToCart, deleteCartItem, getCart, updateCartItemQuantity } from "./cart.controller";

const routes = (app:Router)=>{
  app.get('/',acl,getCart);
  app.post('/:productId',acl,addToCart);
  app.delete('/:productId',acl,deleteCartItem);
  app.put('/:productId',acl,updateCartItemQuantity);
}

export const cartRoutes = withRoutes(routes);