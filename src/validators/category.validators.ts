import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    description: z.string().trim().max(500).optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().max(500).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, "Debe enviar al menos un campo para actualizar"),
});

export const categoryIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
});

export const listCategoriesQuerySchema = z.object({
  query: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
