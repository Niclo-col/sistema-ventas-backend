import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuthContext } from "../middlewares/authContext";
import { loginRateLimiter } from "../middlewares/rateLimiter";
import { loginSchema, refreshSchema } from "../validators/auth.validators";

export const authRouter = Router();

authRouter.post("/login", loginRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.get("/me", requireAuthContext, authController.me);
