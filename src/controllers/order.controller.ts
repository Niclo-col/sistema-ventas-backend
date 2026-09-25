import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { orderService } from "../services/order.service";

export const orderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.body, req.authContext!);
    res.status(201).json(order);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getById(req.params.id);
    res.status(200).json(order);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.list(req.query as any, req.authContext!);
    res.status(200).json(result);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.cancelOrder(req.params.id, req.authContext!);
    res.status(200).json(order);
  }),
};
