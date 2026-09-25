import { userRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { toPublicUser } from "../utils/userMapper";
import { buildPaginatedResult } from "../utils/pagination";
import { AppError, ConflictError, NotFoundError } from "../utils/AppError";
import { CreateUserDTO, ListUserFilters, UpdateUserDTO } from "../entities/user.types";

export const userService = {
  async create(dto: CreateUserDTO) {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError("Ya existe un usuario con ese email");

    const roleId = await userRepository.findRoleIdByName(dto.role);
    if (!roleId) {
      // Solo puede pasar si la BD no fue seedeada con los roles base.
      throw new AppError(`El rol ${dto.role} no existe en la base de datos`, 500, "ROLE_NOT_SEEDED");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({ email: dto.email, passwordHash, roleId });
    return toPublicUser(user);
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return toPublicUser(user);
  },

  async list(filters: ListUserFilters) {
    const { data, total } = await userRepository.findMany(filters);
    return buildPaginatedResult(data.map(toPublicUser), total, filters);
  },

  async update(id: string, dto: UpdateUserDTO) {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError("Usuario no encontrado");

    let roleId: string | undefined;
    if (dto.role) {
      const foundRoleId = await userRepository.findRoleIdByName(dto.role);
      if (!foundRoleId) throw new AppError(`El rol ${dto.role} no existe`, 500, "ROLE_NOT_SEEDED");
      roleId = foundRoleId;
    }

    const user = await userRepository.update(id, {
      ...(roleId ? { role: { connect: { id: roleId } } } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    });

    return toPublicUser(user);
  },
};
