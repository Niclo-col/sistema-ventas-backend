import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { createOrderSchema, orderIdParamSchema, listOrdersQuerySchema } from "../validators/order.validators";

export const orderRouter = Router();

// Toda ruta de órdenes necesita saber quién es el actor (ver ambigüedad Fase 5).
orderRouter.use(requireAuthContext);

orderRouter.get("/", validate(listOrdersQuerySchema), orderController.list);
orderRouter.get("/:id", validate(orderIdParamSchema), orderController.getById);
orderRouter.post("/", validate(createOrderSchema), orderController.create);
orderRouter.patch("/:id/cancel", validate(orderIdParamSchema), orderController.cancel);
