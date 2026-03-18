import { withRoutes } from "@helpers";
import { acl } from "@middlewares";
import { Router } from "express";
import { buyNow, cancelOrder, checkout, getOrder, getOrders, stripeWebHook } from "./orders.controller";
import express from "express" 

const routes = (app: Router) => {
  app.get('/my-orders',acl,getOrders)
  app.post("/checkout", acl, checkout);
  app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebHook
  );
  app.post('/buy-now/:productId',acl,buyNow)
  app.put('/cancel-order/:orderId',acl,cancelOrder)
  app.get('/my-order/:orderId',acl,getOrder)
};

export const orderRoutes = withRoutes(routes);
