import { categoryService } from "../../src/services/category.service";
import { categoryRepository } from "../../src/repositories/category.repository";
import { ConflictError, NotFoundError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/category.repository");

const mockedRepo = categoryRepository as jest.Mocked<typeof categoryRepository>;

describe("categoryService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getById", () => {
    it("lanza NotFoundError si la categoría no existe", async () => {
      mockedRepo.findById.mockResolvedValue(null);
      await expect(categoryService.getById("id-inexistente")).rejects.toThrow(NotFoundError);
    });

    it("retorna la categoría si existe", async () => {
      const category = { id: "1", name: "Bebidas" } as any;
      mockedRepo.findById.mockResolvedValue(category);
      await expect(categoryService.getById("1")).resolves.toEqual(category);
    });
  });

  describe("softDelete", () => {
    it("lanza ConflictError si tiene productos activos", async () => {
      mockedRepo.findById.mockResolvedValue({ id: "1" } as any);
      mockedRepo.countActiveProducts.mockResolvedValue(3);

      await expect(categoryService.softDelete("1")).rejects.toThrow(ConflictError);
      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });

    it("elimina (soft delete) si no tiene productos activos", async () => {
      mockedRepo.findById.mockResolvedValue({ id: "1" } as any);
      mockedRepo.countActiveProducts.mockResolvedValue(0);
      mockedRepo.softDelete.mockResolvedValue({ id: "1" } as any);

      await categoryService.softDelete("1");
      expect(mockedRepo.softDelete).toHaveBeenCalledWith("1");
    });
  });
});
