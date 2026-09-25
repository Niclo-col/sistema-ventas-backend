import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// Singleton: evita agotar el pool de conexiones abriendo múltiples
// PrismaClient (problema común con hot-reload en desarrollo).
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
