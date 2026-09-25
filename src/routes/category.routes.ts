import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { requireRole } from "../middlewares/requireRole";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  listCategoriesQuerySchema,
} from "../validators/category.validators";

export const categoryRouter = Router();

// Cualquier usuario autenticado (ADMIN o SELLER) puede leer.
categoryRouter.use(requireAuthContext);

categoryRouter.get("/", validate(listCategoriesQuerySchema), categoryController.list);
categoryRouter.get("/:id", validate(categoryIdParamSchema), categoryController.getById);

// Escritura exclusiva de ADMIN (tabla de permisos, Fase 1 §21).
categoryRouter.post("/", requireRole("ADMIN"), validate(createCategorySchema), categoryController.create);
categoryRouter.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  categoryController.update
);
categoryRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(categoryIdParamSchema),
  categoryController.remove
);
