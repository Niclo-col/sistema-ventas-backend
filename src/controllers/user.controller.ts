import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { userService } from "../services/user.service";

export const userController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    res.status(200).json(user);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.list(req.query as any);
    res.status(200).json(result);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    res.status(200).json(user);
  }),
};
