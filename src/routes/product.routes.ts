import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { requireRole } from "../middlewares/requireRole";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from "../validators/product.validators";

export const productRouter = Router();

productRouter.use(requireAuthContext);

productRouter.get("/", validate(listProductsQuerySchema), productController.list);
productRouter.get("/:id", validate(productIdParamSchema), productController.getById);

productRouter.post("/", requireRole("ADMIN"), validate(createProductSchema), productController.create);
productRouter.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(updateProductSchema),
  productController.update
);
productRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(productIdParamSchema),
  productController.remove
);
