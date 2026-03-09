import { Router } from "express";

export const withRoutes = (initRoutes: (router: Router) => void) => {
  const router = Router();
  initRoutes(router);
  return router;
};
