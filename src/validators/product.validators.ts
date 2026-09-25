import { z } from "zod";

// price_usd viaja como string para no perder precisión en JSON, pero debe
// representar un número decimal positivo válido.
const priceUsdSchema = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, "priceUsd debe ser un número decimal positivo (máx. 4 decimales)")
  .refine((val) => parseFloat(val) > 0, "priceUsd debe ser mayor a 0");

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("categoryId inválido"),
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(150),
    description: z.string().trim().max(500).optional(),
    priceUsd: priceUsdSchema,
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
  body: z
    .object({
      categoryId: z.string().uuid().optional(),
      name: z.string().trim().min(2).max(150).optional(),
      description: z.string().trim().max(500).optional(),
      priceUsd: priceUsdSchema.optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, "Debe enviar al menos un campo para actualizar"),
});

export const productIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
