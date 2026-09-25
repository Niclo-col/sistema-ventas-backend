import { categoryRepository } from "../repositories/category.repository";
import { buildPaginatedResult } from "../utils/pagination";
import { ConflictError, NotFoundError } from "../utils/AppError";
import { CreateCategoryDTO, ListCategoryFilters, UpdateCategoryDTO } from "../entities/category.types";

export const categoryService = {
  async list(filters: ListCategoryFilters) {
    const { data, total } = await categoryRepository.findMany(filters);
    return buildPaginatedResult(data, total, filters);
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Categoría no encontrada");
    return category;
  },

  async create(dto: CreateCategoryDTO) {
    return categoryRepository.create({ name: dto.name, description: dto.description });
  },

  async update(id: string, dto: UpdateCategoryDTO) {
    await this.getById(id); // valida existencia (404 si no existe o está borrada)
    return categoryRepository.update(id, dto);
  },

  async softDelete(id: string) {
    await this.getById(id);

    // Regla de Fase 1: no se borra una categoría con productos activos.
    const activeProducts = await categoryRepository.countActiveProducts(id);
    if (activeProducts > 0) {
      throw new ConflictError(
        `No se puede eliminar la categoría: tiene ${activeProducts} producto(s) activo(s). ` +
          "Desactívalos o reasígnalos primero."
      );
    }

    return categoryRepository.softDelete(id);
  },
};
