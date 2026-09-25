import { z } from "zod";

const rateSchema = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, "rate debe ser un número decimal positivo (máx. 6 decimales)")
  .refine((val) => parseFloat(val) > 0, "rate debe ser mayor a 0");

export const registerManualRateSchema = z.object({
  body: z.object({
    rate: rateSchema,
    sourceCurrency: z.string().trim().length(3).toUpperCase().default("USD"),
    targetCurrency: z.string().trim().length(3).toUpperCase().default("VES"),
    effectiveAt: z.string().datetime().optional(),
  }),
});

export const exchangeRateIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id inválido") }),
});

export const listExchangeRatesQuerySchema = z.object({
  query: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});
