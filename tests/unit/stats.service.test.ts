import { statsService } from "../../src/services/stats.service";
import { statsRepository } from "../../src/repositories/stats.repository";
import { ValidationError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/stats.repository");

const mockedRepo = statsRepository as jest.Mocked<typeof statsRepository>;

describe("statsService", () => {
  afterEach(() => jest.clearAllMocks());

  it("lanza ValidationError si dateFrom es posterior a dateTo", async () => {
    await expect(
      statsService.getSummary({ dateFrom: "2026-09-20T00:00:00Z", dateTo: "2026-09-10T00:00:00Z" })
    ).rejects.toThrow(ValidationError);
    expect(mockedRepo.getSalesSummary).not.toHaveBeenCalled();
  });

  it("getSummary delega en el repositorio con un rango válido", async () => {
    mockedRepo.getSalesSummary.mockResolvedValue({
      totalOrders: 5,
      totalUsd: "100",
      totalVes: "85000",
      averageOrderUsd: "20",
    } as any);

    const result = await statsService.getSummary({});
    expect(result.totalOrders).toBe(5);
  });

  it("getByProduct mapea los campos agregados al formato de salida", async () => {
    mockedRepo.getSalesByProduct.mockResolvedValue([
      {
        productId: "p1",
        productNameSnapshot: "Refresco",
        _sum: { subtotalUsd: "50", quantity: 20 },
      },
    ] as any);

    const result = await statsService.getByProduct({ limit: 10 });
    expect(result).toEqual([
      { productId: "p1", productName: "Refresco", totalUsd: "50", totalQuantity: 20 },
    ]);
  });
});
