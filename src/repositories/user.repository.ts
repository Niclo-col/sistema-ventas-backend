import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { toSkipTake } from "../utils/pagination";
import { ListUserFilters } from "../entities/user.types";

const withRole = { role: true } satisfies Prisma.UserInclude;

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: withRole });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: withRole });
  },

  async findRoleIdByName(name: "ADMIN" | "SELLER") {
    const role = await prisma.role.findUnique({ where: { name } });
    return role?.id ?? null;
  },

  async create(data: { email: string; passwordHash: string; roleId: string }) {
    return prisma.user.create({ data, include: withRole });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, include: withRole });
  },

  async findMany(filters: ListUserFilters) {
    const where: Prisma.UserWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.role ? { role: { name: filters.role } } : {}),
    };
    const { skip, take } = toSkipTake(filters);

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip, take, include: withRole, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  },
};
