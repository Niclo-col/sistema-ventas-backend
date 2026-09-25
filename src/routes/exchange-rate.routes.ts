import { Router } from "express";
import { exchangeRateController } from "../controllers/exchange-rate.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { requireRole } from "../middlewares/requireRole";
import {
  registerManualRateSchema,
  exchangeRateIdParamSchema,
  listExchangeRatesQuerySchema,
} from "../validators/exchange-rate.validators";

// Tasas de cambio: exclusivo de ADMIN, sin excepción de lectura para SELLER
// (tabla de permisos, Fase 1 §21) — un SELLER no necesita consultarlas
// directamente, la orden ya toma la tasa vigente internamente.
export const exchangeRateRouter = Router();
exchangeRateRouter.use(requireAuthContext, requireRole("ADMIN"));

exchangeRateRouter.get("/current", exchangeRateController.getCurrent);
exchangeRateRouter.get("/", validate(listExchangeRatesQuerySchema), exchangeRateController.list);
exchangeRateRouter.post("/sync", exchangeRateController.sync);
exchangeRateRouter.post("/", validate(registerManualRateSchema), exchangeRateController.registerManual);
exchangeRateRouter.patch(
  "/:id/invalidate",
  validate(exchangeRateIdParamSchema),
  exchangeRateController.invalidate
);
