import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { DateRangeFilter, SalesByPeriodFilter, TopNFilter } from "../entities/stats.types";

function dateFilter(filters: DateRangeFilter) {
  if (!filters.dateFrom && !filters.dateTo) return undefined;
  return {
    ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
    ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
  };
}

export interface SalesByPeriodRow {
  period: Date;
  total_usd: Prisma.Decimal;
  total_ves: Prisma.Decimal;
  order_count: number;
}

export const statsRepository = {
  async getSalesSummary(filters: DateRangeFilter) {
    const createdAt = dateFilter(filters);

    const result = await prisma.order.aggregate({
      where: { status: "COMPLETED", ...(createdAt ? { createdAt } : {}) },
      _count: { _all: true },
      _sum: { totalUsd: true, totalVes: true },
      _avg: { totalUsd: true },
    });

    return {
      totalOrders: result._count._all,
      totalUsd: result._sum.totalUsd ?? new Prisma.Decimal(0),
      totalVes: result._sum.totalVes ?? new Prisma.Decimal(0),
      averageOrderUsd: result._avg.totalUsd ?? new Prisma.Decimal(0),
    };
  },

  // date_trunc parametrizado (Prisma.sql con bind, no concatenación) — el
  // valor de groupBy ya viene validado por Zod (enum day|week|month).
  async getSalesByPeriod(filters: SalesByPeriodFilter): Promise<SalesByPeriodRow[]> {
    const fromClause = filters.dateFrom
      ? Prisma.sql`AND created_at >= ${new Date(filters.dateFrom)}`
      : Prisma.empty;
    const toClause = filters.dateTo ? Prisma.sql`AND created_at <= ${new Date(filters.dateTo)}` : Prisma.empty;

    return prisma.$queryRaw<SalesByPeriodRow[]>`
      SELECT
        date_trunc(${filters.groupBy}, created_at) AS period,
        COALESCE(SUM(total_usd), 0) AS total_usd,
        COALESCE(SUM(total_ves), 0) AS total_ves,
        COUNT(*)::int AS order_count
      FROM orders
      WHERE status = 'COMPLETED'
      ${fromClause}
      ${toClause}
      GROUP BY period
      ORDER BY period ASC
    `;
  },

  async getSalesByProduct(filters: TopNFilter) {
    const createdAt = dateFilter(filters);

    return prisma.orderItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      where: { order: { status: "COMPLETED", ...(createdAt ? { createdAt } : {}) } },
      _sum: { subtotalUsd: true, quantity: true },
      orderBy: { _sum: { subtotalUsd: "desc" } },
      take: filters.limit,
    });
  },

  async getSalesByCategory(filters: TopNFilter) {
    const createdAt = dateFilter(filters);

    return prisma.orderItem.groupBy({
      by: ["categoryIdSnapshot", "categoryNameSnapshot"],
      where: { order: { status: "COMPLETED", ...(createdAt ? { createdAt } : {}) } },
      _sum: { subtotalUsd: true, quantity: true },
      orderBy: { _sum: { subtotalUsd: "desc" } },
      take: filters.limit,
    });
  },
};
