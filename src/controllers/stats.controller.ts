import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { statsService } from "../services/stats.service";

export const statsController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const result = await statsService.getSummary(req.query as any);
    res.status(200).json(result);
  }),

  byPeriod: asyncHandler(async (req: Request, res: Response) => {
    const result = await statsService.getByPeriod(req.query as any);
    res.status(200).json(result);
  }),

  byProduct: asyncHandler(async (req: Request, res: Response) => {
    const result = await statsService.getByProduct(req.query as any);
    res.status(200).json(result);
  }),

  byCategory: asyncHandler(async (req: Request, res: Response) => {
    const result = await statsService.getByCategory(req.query as any);
    res.status(200).json(result);
  }),
};
