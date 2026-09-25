import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { categoryService } from "../services/category.service";

export const categoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.list(req.query as any);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getById(req.params.id);
    res.status(200).json(category);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    res.status(200).json(category);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.softDelete(req.params.id);
    res.status(204).send();
  }),
};
