import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { requireRole } from "../middlewares/requireRole";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from "../validators/user.validators";

export const userRouter = Router();

// Gestionar usuarios es exclusivo de ADMIN (tabla de permisos, Fase 1 §21).
userRouter.use(requireAuthContext, requireRole("ADMIN"));

userRouter.get("/", validate(listUsersQuerySchema), userController.list);
userRouter.get("/:id", validate(userIdParamSchema), userController.getById);
userRouter.post("/", validate(createUserSchema), userController.create);
userRouter.patch("/:id", validate(updateUserSchema), userController.update);
