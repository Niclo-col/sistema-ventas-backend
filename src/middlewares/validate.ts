import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

/**
 * Valida req.{body,params,query} contra un esquema Zod combinado y reemplaza
 * esas propiedades con los datos ya parseados/coercionados (p. ej. page como
 * number en vez de string). Los errores los captura el errorHandler global.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params;
    if (parsed.query) req.query = parsed.query as any;

    next();
  };
}
