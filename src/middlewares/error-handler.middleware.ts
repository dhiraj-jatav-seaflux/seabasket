import { NextFunction, Request, Response } from "express";

// Standard error response format
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || undefined;
  res.status(status).json({
    error: {
      message,
      ...(errors && { details: errors }),
    },
  });
}
