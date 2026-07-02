import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as { message?: string; status?: unknown; statusCode?: unknown };
  
  const rawStatus = error.statusCode ?? error.status;
  const parsedStatus =
    typeof rawStatus === "number"
      ? rawStatus
      : typeof rawStatus === "string"
        ? Number.parseInt(rawStatus, 10)
        : NaN;
  
  const statusCode =
    Number.isFinite(parsedStatus) && parsedStatus >= 400 && parsedStatus <= 599
      ? parsedStatus
      : 500;
  
  const isDevelopment = process.env.NODE_ENV === "development";
  const is5xx = statusCode >= 500;

  const message =
    isDevelopment || !is5xx
      ? error.message ?? "Internal Server Error"
      : "Internal Server Error";

  res.status(statusCode).json({ message });
};
