import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Middleware único de manejo de errores. Cualquier error lanzado (o pasado a
 * next()) en controllers/services termina aquí. Nunca expone stack traces
 * ni detalles internos en producción.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    logger.warn({ err: err.flatten() }, "Error de validación");
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos de entrada inválidos",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ err, path: req.path }, err.message);
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Error no controlado / inesperado
  logger.error({ err, path: req.path }, "Error no controlado");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocurrió un error inesperado",
      // El stack solo se expone en desarrollo, nunca en producción.
      stack: env.NODE_ENV === "development" ? (err as Error)?.stack : undefined,
    },
  });
}

/**
 * Envuelve un handler async para que sus rechazos lleguen al errorHandler
 * sin necesidad de try/catch repetido en cada controller.
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
