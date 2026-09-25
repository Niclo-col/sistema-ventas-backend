import { orderService } from "../../src/services/order.service";
import { orderRepository } from "../../src/repositories/order.repository";
import { productRepository } from "../../src/repositories/product.repository";
import { exchangeRateService } from "../../src/services/exchange-rate.service";
import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from "../../src/utils/AppError";
import { env } from "../../src/config/env";

jest.mock("../../src/repositories/order.repository");
jest.mock("../../src/repositories/product.repository");
jest.mock("../../src/services/exchange-rate.service");

const mockedOrderRepo = orderRepository as jest.Mocked<typeof orderRepository>;
const mockedProductRepo = productRepository as jest.Mocked<typeof productRepository>;
const mockedExchangeRateService = exchangeRateService as jest.Mocked<typeof exchangeRateService>;

const ADMIN = { userId: "admin-1", role: "ADMIN" as const };
const SELLER = { userId: "seller-1", role: "SELLER" as const };

const fakeProduct = {
  id: "p1",
  name: "Refresco",
  priceUsd: "2.50",
  status: "ACTIVE",
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Bebidas" },
};

const fakeRate = { rate: "853.4993", effectiveAt: new Date("2026-09-23T00:00:00Z") };

describe("orderService.createOrder", () => {
  afterEach(() => jest.clearAllMocks());

  it("calcula totalUsd/totalVes correctamente y crea la orden", async () => {
    mockedExchangeRateService.getCurrent.mockResolvedValue(fakeRate as any);
    mockedProductRepo.findById.mockResolvedValue(fakeProduct as any);
    mockedOrderRepo.createWithItems.mockResolvedValue({ id: "o1" } as any);

    await orderService.createOrder({ items: [{ productId: "p1", quantity: 3 }] }, ADMIN);

    const callArg = mockedOrderRepo.createWithItems.mock.calls[0][0];
    expect(callArg.totalUsd.toString()).toBe("7.5"); // 2.50 * 3
    expect(callArg.userId).toBe("admin-1");
    expect(callArg.items[0]).toMatchObject({
      productNameSnapshot: "Refresco",
      categoryNameSnapshot: "Bebidas",
      quantity: 3,
    });
  });

  it("lanza NotFoundError si el producto no existe", async () => {
    mockedExchangeRateService.getCurrent.mockResolvedValue(fakeRate as any);
    mockedProductRepo.findById.mockResolvedValue(null);

    await expect(
      orderService.createOrder({ items: [{ productId: "x", quantity: 1 }] }, ADMIN)
    ).rejects.toThrow(NotFoundError);
    expect(mockedOrderRepo.createWithItems).not.toHaveBeenCalled();
  });

  it("lanza ValidationError si el producto está inactivo", async () => {
    mockedExchangeRateService.getCurrent.mockResolvedValue(fakeRate as any);
    mockedProductRepo.findById.mockResolvedValue({ ...fakeProduct, status: "INACTIVE" } as any);

    await expect(
      orderService.createOrder({ items: [{ productId: "p1", quantity: 1 }] }, ADMIN)
    ).rejects.toThrow(ValidationError);
  });

  it("propaga el NotFoundError si no hay tasa de cambio vigente", async () => {
    mockedExchangeRateService.getCurrent.mockRejectedValue(new NotFoundError("sin tasa"));

    await expect(
      orderService.createOrder({ items: [{ productId: "p1", quantity: 1 }] }, ADMIN)
    ).rejects.toThrow(NotFoundError);
    expect(mockedProductRepo.findById).not.toHaveBeenCalled();
  });
});

describe("orderService.cancelOrder", () => {
  afterEach(() => jest.clearAllMocks());

  it("lanza NotFoundError si la orden no existe", async () => {
    mockedOrderRepo.findById.mockResolvedValue(null);
    await expect(orderService.cancelOrder("o1", ADMIN)).rejects.toThrow(NotFoundError);
  });

  it("lanza ConflictError si ya está cancelada", async () => {
    mockedOrderRepo.findById.mockResolvedValue({ id: "o1", status: "CANCELLED" } as any);
    await expect(orderService.cancelOrder("o1", ADMIN)).rejects.toThrow(ConflictError);
  });

  it("SELLER no puede cancelar la orden de otro vendedor", async () => {
    mockedOrderRepo.findById.mockResolvedValue({
      id: "o1",
      status: "COMPLETED",
      userId: "otro-seller",
      createdAt: new Date(),
    } as any);

    await expect(orderService.cancelOrder("o1", SELLER)).rejects.toThrow(ForbiddenError);
  });

  it("SELLER no puede cancelar fuera de la ventana de tiempo", async () => {
    const pastDate = new Date(Date.now() - (env.ORDER_CANCELLATION_WINDOW_MINUTES + 5) * 60 * 1000);
    mockedOrderRepo.findById.mockResolvedValue({
      id: "o1",
      status: "COMPLETED",
      userId: SELLER.userId,
      createdAt: pastDate,
    } as any);

    await expect(orderService.cancelOrder("o1", SELLER)).rejects.toThrow(ForbiddenError);
  });

  it("SELLER puede cancelar su propia orden dentro de la ventana", async () => {
    mockedOrderRepo.findById.mockResolvedValue({
      id: "o1",
      status: "COMPLETED",
      userId: SELLER.userId,
      createdAt: new Date(),
    } as any);
    mockedOrderRepo.markCancelled.mockResolvedValue({ id: "o1", status: "CANCELLED" } as any);

    await orderService.cancelOrder("o1", SELLER);
    expect(mockedOrderRepo.markCancelled).toHaveBeenCalledWith("o1", SELLER.userId);
  });

  it("ADMIN puede cancelar cualquier orden sin restricción de ventana", async () => {
    const veryOldDate = new Date(Date.now() - 999 * 60 * 1000);
    mockedOrderRepo.findById.mockResolvedValue({
      id: "o1",
      status: "COMPLETED",
      userId: "cualquier-seller",
      createdAt: veryOldDate,
    } as any);
    mockedOrderRepo.markCancelled.mockResolvedValue({ id: "o1", status: "CANCELLED" } as any);

    await orderService.cancelOrder("o1", ADMIN);
    expect(mockedOrderRepo.markCancelled).toHaveBeenCalledWith("o1", ADMIN.userId);
  });
});
