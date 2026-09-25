import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { toSkipTake } from "../utils/pagination";
import { ListOrderFilters } from "../entities/order.types";

export interface OrderItemInsert {
  productId: string;
  productNameSnapshot: string;
  categoryIdSnapshot: string | null;
  categoryNameSnapshot: string;
  unitPriceUsdSnapshot: Prisma.Decimal;
  quantity: number;
  subtotalUsd: Prisma.Decimal;
}

export interface CreateOrderData {
  orderNumber: string;
  userId: string;
  customerId?: string;
  totalUsd: Prisma.Decimal;
  exchangeRate: Prisma.Decimal;
  totalVes: Prisma.Decimal;
  exchangeRateAt: Date;
  items: OrderItemInsert[];
}

function buildWhere(filters: Pick<ListOrderFilters, "status" | "userId" | "dateFrom" | "dateTo">) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.userId) where.userId = filters.userId;
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    };
  }
  return where;
}

export const orderRepository = {
  /**
   * Crea la Order y todos sus OrderItem en una única transacción: si algo
   * falla a mitad de camino (incluida la restricción de unicidad de
   * orderNumber), Prisma hace rollback completo automáticamente.
   */
  async createWithItems(data: CreateOrderData) {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        customerId: data.customerId,
        totalUsd: data.totalUsd,
        exchangeRate: data.exchangeRate,
        totalVes: data.totalVes,
        exchangeRateAt: data.exchangeRateAt,
        items: { create: data.items },
      },
      include: { items: true },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  },

  async findMany(filters: ListOrderFilters) {
    const where = buildWhere(filters);
    const { skip, take } = toSkipTake(filters);

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, total };
  },

  async markCancelled(id: string, cancelledBy: string) {
    return prisma.order.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelledBy },
    });
  },
};
