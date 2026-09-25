import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().trim().min(1).max(150).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("productId inválido"),
          quantity: z.number().int().positive("quantity debe ser un entero positivo"),
        })
      )
      .min(1, "La orden debe tener al menos un ítem")
      .max(100, "Demasiados ítems en una sola orden"),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    status: z.enum(["COMPLETED", "CANCELLED"]).optional(),
    userId: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
