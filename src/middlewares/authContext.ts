import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

export type Role = "ADMIN" | "SELLER";

export interface AuthContext {
  userId: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

/**
 * Verifica el JWT de acceso enviado como `Authorization: Bearer <token>` y
 * puebla `req.authContext`. Reemplaza el puente temporal por headers que se
 * usó desde la Fase 5 — el resto del código (controllers, services de
 * Order) no cambia porque consume la misma forma de req.authContext.
 */
export function requireAuthContext(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Falta el header Authorization: Bearer <token>");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.authContext = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedError("Token inválido o expirado");
  }
}
