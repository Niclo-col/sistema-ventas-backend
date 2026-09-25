import { statsRepository } from "../repositories/stats.repository";
import { ValidationError } from "../utils/AppError";
import { DateRangeFilter, SalesByPeriodFilter, TopNFilter } from "../entities/stats.types";

function assertValidRange(filters: DateRangeFilter) {
  if (filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo)) {
    throw new ValidationError("dateFrom no puede ser posterior a dateTo");
  }
}

export const statsService = {
  async getSummary(filters: DateRangeFilter) {
    assertValidRange(filters);
    return statsRepository.getSalesSummary(filters);
  },

  async getByPeriod(filters: SalesByPeriodFilter) {
    assertValidRange(filters);
    const rows = await statsRepository.getSalesByPeriod(filters);
    return rows.map((row) => ({
      period: row.period,
      totalUsd: row.total_usd,
      totalVes: row.total_ves,
      orderCount: row.order_count,
    }));
  },

  async getByProduct(filters: TopNFilter) {
    assertValidRange(filters);
    const rows = await statsRepository.getSalesByProduct(filters);
    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productNameSnapshot,
      totalUsd: row._sum.subtotalUsd,
      totalQuantity: row._sum.quantity,
    }));
  },

  async getByCategory(filters: TopNFilter) {
    assertValidRange(filters);
    const rows = await statsRepository.getSalesByCategory(filters);
    return rows.map((row) => ({
      categoryId: row.categoryIdSnapshot,
      categoryName: row.categoryNameSnapshot,
      totalUsd: row._sum.subtotalUsd,
      totalQuantity: row._sum.quantity,
    }));
  },
};
