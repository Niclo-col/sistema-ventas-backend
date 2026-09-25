import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../utils/AppError";
import { Role } from "./authContext";

/** Debe ir siempre después de requireAuthContext en la cadena de middlewares. */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authContext || !allowedRoles.includes(req.authContext.role)) {
      throw new ForbiddenError("No tienes permiso para realizar esta acción");
    }
    next();
  };
}
