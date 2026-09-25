import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { toSkipTake } from "../utils/pagination";
import { ListProductFilters } from "../entities/product.types";

function buildWhere(
  filters: Pick<ListProductFilters, "status" | "search" | "categoryId">
): Prisma.ProductWhereInput {
  return {
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
  };
}

export const productRepository = {
  async findMany(filters: ListProductFilters) {
    const where = buildWhere(filters);
    const { skip, take } = toSkipTake(filters);

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { category: true } }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: string) {
    return prisma.product.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
  },

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data, include: { category: true } });
  },

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: "INACTIVE", deletedAt: new Date() },
    });
  },
};
