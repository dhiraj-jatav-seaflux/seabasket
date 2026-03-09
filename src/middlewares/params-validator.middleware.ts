import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import { ZodSchema } from "zod";

export const paramsValidator = <T>(schema: ZodSchema<T>) => {
  return (req: TRequest, res: TResponse, next: NextFunction) => {
    const result = schema.safeParse({ ...req.params, _me: req.me });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json({ errors: errors });
      return;
    }

    req.params = result.data as any;
    next();
  };
};
