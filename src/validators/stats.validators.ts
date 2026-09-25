import { z } from "zod";

const dateRange = {
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
};

export const salesSummaryQuerySchema = z.object({
  query: z.object(dateRange),
});

export const salesByPeriodQuerySchema = z.object({
  query: z.object({
    ...dateRange,
    groupBy: z.enum(["day", "week", "month"]).default("day"),
  }),
});

export const topNQuerySchema = z.object({
  query: z.object({
    ...dateRange,
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});
