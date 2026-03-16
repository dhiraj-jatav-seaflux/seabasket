import { withRoutes } from "@helpers";
import { adminRoutes } from "@modules/admin/admin.route";
import { miscRoutes } from "@modules/misc";
import { orderRoutes } from "@modules/orders";
import { productRoutes } from "@modules/products";
import { userRoutes } from "@modules/user";
import { Router } from "express";

const routes = (app: Router) => {
  app.get("/health-check", (_, res) => {
    res.status(200).json({ status: "OK" });
  });

  // Register all routes here
  app.use("/misc", miscRoutes);
  app.use("/users", userRoutes);
  app.use("/admin",adminRoutes)
  app.use("/products",productRoutes)
  app.use('/orders',orderRoutes)
  // Handle 404
  app.all("/*splat", (_, res) => {
    res.status(404).json({
      error: "Requested URL not found!",
    });
  });
};

export const configureRoutes = withRoutes(routes);
