import { withRoutes } from "@helpers";
import { acl } from "@middlewares";
import { Router } from "express";
import { checkout, getOrder, getOrders, stripeWebHook } from "./orders.controller";
import express from "express" 

const routes = (app: Router) => {
  app.get('/my-orders',acl,getOrders)
  app.post("/checkout", acl, checkout);
  app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebHook
  );
  app.get('/my-order/:orderId',acl,getOrder)
};

export const orderRoutes = withRoutes(routes);
