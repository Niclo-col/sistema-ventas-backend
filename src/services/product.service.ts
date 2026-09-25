import { productRepository } from "../repositories/product.repository";
import { categoryRepository } from "../repositories/category.repository";
import { buildPaginatedResult } from "../utils/pagination";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { CreateProductDTO, ListProductFilters, UpdateProductDTO } from "../entities/product.types";

async function assertCategoryUsable(categoryId: string) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new NotFoundError("La categoría indicada no existe");
  if (category.status !== "ACTIVE") {
    throw new ValidationError("No se puede asignar un producto a una categoría inactiva");
  }
  return category;
}

export const productService = {
  async list(filters: ListProductFilters) {
    const { data, total } = await productRepository.findMany(filters);
    return buildPaginatedResult(data, total, filters);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Producto no encontrado");
    return product;
  },

  async create(dto: CreateProductDTO) {
    await assertCategoryUsable(dto.categoryId);

    return productRepository.create({
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      priceUsd: dto.priceUsd,
    });
  },

  async update(id: string, dto: UpdateProductDTO) {
    await this.getById(id); // 404 si no existe o está borrado

    if (dto.categoryId) {
      await assertCategoryUsable(dto.categoryId);
    }

    return productRepository.update(id, dto);
  },

  async softDelete(id: string) {
    await this.getById(id);
    // A diferencia de Category, un producto sí puede desactivarse aunque
    // tenga órdenes asociadas: el histórico vive en el snapshot de
    // OrderItem y no depende del estado actual del producto.
    return productRepository.softDelete(id);
  },
};
