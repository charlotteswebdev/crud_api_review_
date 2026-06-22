import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as { message?: string; status?: number; statusCode?: number };
  const statusCode = error.statusCode ?? error.status ?? 500;

  res.status(statusCode).json({
    message: error.message ?? "Internal Server Error",
  });
};
