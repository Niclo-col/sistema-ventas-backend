import { productService } from "../../src/services/product.service";
import { productRepository } from "../../src/repositories/product.repository";
import { categoryRepository } from "../../src/repositories/category.repository";
import { NotFoundError, ValidationError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/product.repository");
jest.mock("../../src/repositories/category.repository");

const mockedProductRepo = productRepository as jest.Mocked<typeof productRepository>;
const mockedCategoryRepo = categoryRepository as jest.Mocked<typeof categoryRepository>;

describe("productService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("lanza NotFoundError si la categoría no existe", async () => {
      mockedCategoryRepo.findById.mockResolvedValue(null);

      await expect(
        productService.create({ categoryId: "x", name: "Refresco", priceUsd: "1.50" })
      ).rejects.toThrow(NotFoundError);
      expect(mockedProductRepo.create).not.toHaveBeenCalled();
    });

    it("lanza ValidationError si la categoría está inactiva", async () => {
      mockedCategoryRepo.findById.mockResolvedValue({ id: "x", status: "INACTIVE" } as any);

      await expect(
        productService.create({ categoryId: "x", name: "Refresco", priceUsd: "1.50" })
      ).rejects.toThrow(ValidationError);
    });

    it("crea el producto si la categoría está activa", async () => {
      mockedCategoryRepo.findById.mockResolvedValue({ id: "x", status: "ACTIVE" } as any);
      mockedProductRepo.create.mockResolvedValue({ id: "p1" } as any);

      const result = await productService.create({
        categoryId: "x",
        name: "Refresco",
        priceUsd: "1.50",
      });

      expect(result).toEqual({ id: "p1" });
      expect(mockedProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: "x", name: "Refresco", priceUsd: "1.50" })
      );
    });
  });

  describe("softDelete", () => {
    it("lanza NotFoundError si el producto no existe", async () => {
      mockedProductRepo.findById.mockResolvedValue(null);
      await expect(productService.softDelete("p1")).rejects.toThrow(NotFoundError);
    });

    it("permite eliminar (soft) aunque tenga órdenes históricas asociadas", async () => {
      mockedProductRepo.findById.mockResolvedValue({ id: "p1" } as any);
      mockedProductRepo.softDelete.mockResolvedValue({ id: "p1" } as any);

      await productService.softDelete("p1");
      expect(mockedProductRepo.softDelete).toHaveBeenCalledWith("p1");
    });
  });
});
