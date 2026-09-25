import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { toSkipTake } from "../utils/pagination";
import { ListCategoryFilters } from "../entities/category.types";

// Toda consulta filtra deletedAt: null por defecto — una categoría con soft
// delete nunca debe aparecer en listados ni búsquedas por id "normales".

function buildWhere(filters: Pick<ListCategoryFilters, "status" | "search">): Prisma.CategoryWhereInput {
  return {
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
  };
}

export const categoryRepository = {
  async findMany(filters: ListCategoryFilters) {
    const where = buildWhere(filters);
    const { skip, take } = toSkipTake(filters);

    const [data, total] = await prisma.$transaction([
      prisma.category.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.category.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: string) {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  },

  async countActiveProducts(categoryId: string) {
    return prisma.product.count({
      where: { categoryId, status: "ACTIVE", deletedAt: null },
    });
  },

  async create(data: { name: string; description?: string }) {
    return prisma.category.create({ data });
  },

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { status: "INACTIVE", deletedAt: new Date() },
    });
  },
};
