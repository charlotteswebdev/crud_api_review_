import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as { message?: string; status?: number; statusCode?: number };
  const statusCode = error.statusCode ?? error.status ?? 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  const is5xx = statusCode >= 500;

  // Only expose detailed error messages in development or for non-5xx errors
  const message =
    isDevelopment || !is5xx
      ? error.message ?? "Internal Server Error"
      : "Internal Server Error";

  res.status(statusCode).json({ message });
};
