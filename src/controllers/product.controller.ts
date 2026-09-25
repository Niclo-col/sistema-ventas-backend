import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { productService } from "../services/product.service";

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.list(req.query as any);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    res.status(200).json(product);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.status(200).json(product);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productService.softDelete(req.params.id);
    res.status(204).send();
  }),
};
