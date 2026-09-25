import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { toSkipTake } from "../utils/pagination";
import { ListExchangeRateFilters } from "../entities/exchange-rate.types";

export const exchangeRateRepository = {
  async findCurrent(sourceCurrency: string, targetCurrency: string) {
    return prisma.exchangeRate.findFirst({
      where: { sourceCurrency, targetCurrency, status: "ACTIVE" },
      orderBy: { effectiveAt: "desc" },
    });
  },

  async findBySourceAndEffectiveAt(source: string, effectiveAt: Date) {
    return prisma.exchangeRate.findFirst({ where: { source, effectiveAt } });
  },

  async findById(id: string) {
    return prisma.exchangeRate.findUnique({ where: { id } });
  },

  async findMany(filters: ListExchangeRateFilters) {
    const where: Prisma.ExchangeRateWhereInput = filters.status ? { status: filters.status } : {};
    const { skip, take } = toSkipTake(filters);

    const [data, total] = await prisma.$transaction([
      prisma.exchangeRate.findMany({ where, skip, take, orderBy: { effectiveAt: "desc" } }),
      prisma.exchangeRate.count({ where }),
    ]);

    return { data, total };
  },

  async create(data: Prisma.ExchangeRateUncheckedCreateInput) {
    return prisma.exchangeRate.create({ data });
  },

  async invalidate(id: string) {
    return prisma.exchangeRate.update({ where: { id }, data: { status: "INACTIVE" } });
  },
};
