import rateLimit from "express-rate-limit";

/** Máximo 10 intentos de login cada 15 minutos por IP, para mitigar fuerza bruta. */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Demasiados intentos, intenta más tarde" } },
});
