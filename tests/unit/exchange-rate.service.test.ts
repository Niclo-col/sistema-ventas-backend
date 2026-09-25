import { createExchangeRateService } from "../../src/services/exchange-rate.service";
import { exchangeRateRepository } from "../../src/repositories/exchange-rate.repository";
import { ExchangeRateProvider } from "../../src/integrations/exchange-rate/ExchangeRateProvider";
import { NotFoundError } from "../../src/utils/AppError";

jest.mock("../../src/repositories/exchange-rate.repository");

const mockedRepo = exchangeRateRepository as jest.Mocked<typeof exchangeRateRepository>;

const fakeProvider: jest.Mocked<ExchangeRateProvider> = {
  fetchLatestRate: jest.fn(),
};

describe("exchangeRateService", () => {
  const service = createExchangeRateService(fakeProvider);

  afterEach(() => jest.clearAllMocks());

  describe("syncFromProvider", () => {
    const providerResult = {
      rate: "853.4993",
      sourceCurrency: "USD",
      targetCurrency: "VES",
      effectiveAt: new Date("2026-09-22T20:20:01.069Z"),
      source: "bcv.today",
    };

    it("crea una nueva tasa si no existe una igual ya sincronizada", async () => {
      fakeProvider.fetchLatestRate.mockResolvedValue(providerResult);
      mockedRepo.findBySourceAndEffectiveAt.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue({ id: "r1", ...providerResult } as any);

      const result = await service.syncFromProvider();

      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ rate: "853.4993", source: "bcv.today" })
      );
      expect(result).toEqual(expect.objectContaining({ id: "r1" }));
    });

    it("no duplica si ya existe una tasa con el mismo source+effectiveAt", async () => {
      fakeProvider.fetchLatestRate.mockResolvedValue(providerResult);
      mockedRepo.findBySourceAndEffectiveAt.mockResolvedValue({ id: "existing" } as any);

      const result = await service.syncFromProvider();

      expect(mockedRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual({ id: "existing" });
    });
  });

  describe("getCurrent", () => {
    it("lanza NotFoundError si no hay tasa vigente", async () => {
      mockedRepo.findCurrent.mockResolvedValue(null);
      await expect(service.getCurrent()).rejects.toThrow(NotFoundError);
    });

    it("retorna la tasa vigente si existe", async () => {
      mockedRepo.findCurrent.mockResolvedValue({ id: "r1", rate: "853.4993" } as any);
      await expect(service.getCurrent()).resolves.toEqual({ id: "r1", rate: "853.4993" });
    });
  });

  describe("invalidate", () => {
    it("lanza NotFoundError si la tasa no existe", async () => {
      mockedRepo.findById.mockResolvedValue(null);
      await expect(service.invalidate("x")).rejects.toThrow(NotFoundError);
    });

    it("invalida la tasa si existe", async () => {
      mockedRepo.findById.mockResolvedValue({ id: "r1" } as any);
      mockedRepo.invalidate.mockResolvedValue({ id: "r1", status: "INACTIVE" } as any);

      await service.invalidate("r1");
      expect(mockedRepo.invalidate).toHaveBeenCalledWith("r1");
    });
  });
});
