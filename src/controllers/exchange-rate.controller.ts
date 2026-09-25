import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { exchangeRateService } from "../services/exchange-rate.service";

export const exchangeRateController = {
  sync: asyncHandler(async (_req: Request, res: Response) => {
    const rate = await exchangeRateService.syncFromProvider();
    res.status(201).json(rate);
  }),

  registerManual: asyncHandler(async (req: Request, res: Response) => {
    const rate = await exchangeRateService.registerManual(req.body);
    res.status(201).json(rate);
  }),

  getCurrent: asyncHandler(async (_req: Request, res: Response) => {
    const rate = await exchangeRateService.getCurrent();
    res.status(200).json(rate);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await exchangeRateService.list(req.query as any);
    res.status(200).json(result);
  }),

  invalidate: asyncHandler(async (req: Request, res: Response) => {
    const rate = await exchangeRateService.invalidate(req.params.id);
    res.status(200).json(rate);
  }),
};
