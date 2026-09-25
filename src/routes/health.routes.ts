import { Router } from "express";
import { prisma } from "../database/prisma";
import { asyncHandler } from "../middlewares/errorHandler";

export const healthRouter = Router();

// Liveness: el proceso está corriendo.
healthRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness: el proceso y sus dependencias (DB) están listos para recibir tráfico.
healthRouter.get(
  "/health/ready",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "connected" });
  })
);
