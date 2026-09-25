import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { authService } from "../services/auth.service";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.authContext!.userId);
    res.status(200).json(user);
  }),
};
