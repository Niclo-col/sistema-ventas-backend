import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
//import { requireRole } from "../middlewares/requireRole";
import {
  salesSummaryQuerySchema,
  salesByPeriodQuerySchema,
  topNQuerySchema,
} from "../validators/stats.validators";

// Estadísticas: exclusivo de ADMIN (tabla de permisos, Fase 1 §21).
export const statsRouter = Router();
statsRouter.use(requireAuthContext);

statsRouter.get("/summary", validate(salesSummaryQuerySchema), statsController.summary);
statsRouter.get("/by-period", validate(salesByPeriodQuerySchema), statsController.byPeriod);
statsRouter.get("/by-product", validate(topNQuerySchema), statsController.byProduct);
statsRouter.get("/by-category", validate(topNQuerySchema), statsController.byCategory);
