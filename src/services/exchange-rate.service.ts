import { exchangeRateRepository } from "../repositories/exchange-rate.repository";
import { ExchangeRateProvider } from "../integrations/exchange-rate/ExchangeRateProvider";
import { bcvTodayProvider } from "../integrations/exchange-rate/BcvTodayProvider";
import { buildPaginatedResult } from "../utils/pagination";
import { NotFoundError } from "../utils/AppError";
import { ListExchangeRateFilters, RegisterManualRateDTO } from "../entities/exchange-rate.types";

const DEFAULT_SOURCE_CURRENCY = "USD";
const DEFAULT_TARGET_CURRENCY = "VES";

/**
 * Factory con inyección manual del provider (sin framework de DI, suficiente
 * para el alcance del proyecto — ver Fase 1 §9). El export por defecto usa
 * BcvTodayProvider; los tests pueden crear su propia instancia con un mock.
 */
export function createExchangeRateService(provider: ExchangeRateProvider) {
  return {
    /** Sincroniza la tasa vigente desde el proveedor externo configurado. */
    async syncFromProvider() {
      const result = await provider.fetchLatestRate();

      const existing = await exchangeRateRepository.findBySourceAndEffectiveAt(
        result.source,
        result.effectiveAt
      );
      if (existing) return existing; // evita duplicar si ya se sincronizó esta misma tasa

      return exchangeRateRepository.create({
        rate: result.rate,
        sourceCurrency: result.sourceCurrency,
        targetCurrency: result.targetCurrency,
        effectiveAt: result.effectiveAt,
        source: result.source,
      });
    },

    /** Registro manual de una tasa (ADMIN), independiente del proveedor externo. */
    async registerManual(dto: RegisterManualRateDTO) {
      return exchangeRateRepository.create({
        rate: dto.rate,
        sourceCurrency: dto.sourceCurrency ?? DEFAULT_SOURCE_CURRENCY,
        targetCurrency: dto.targetCurrency ?? DEFAULT_TARGET_CURRENCY,
        effectiveAt: dto.effectiveAt ? new Date(dto.effectiveAt) : new Date(),
        source: "manual",
      });
    },

    /** Tasa vigente USD→VES. Lanza NotFoundError si no hay ninguna registrada. */
    async getCurrent(
      sourceCurrency = DEFAULT_SOURCE_CURRENCY,
      targetCurrency = DEFAULT_TARGET_CURRENCY
    ) {
      const rate = await exchangeRateRepository.findCurrent(sourceCurrency, targetCurrency);
      if (!rate) {
        throw new NotFoundError(
          `No existe una tasa de cambio vigente ${sourceCurrency}→${targetCurrency}`
        );
      }
      return rate;
    },

    async list(filters: ListExchangeRateFilters) {
      const { data, total } = await exchangeRateRepository.findMany(filters);
      return buildPaginatedResult(data, total, filters);
    },

    /** Invalida una tasa mal cargada sin borrarla (preserva trazabilidad). */
    async invalidate(id: string) {
      const rate = await exchangeRateRepository.findById(id);
      if (!rate) throw new NotFoundError("Tasa de cambio no encontrada");
      return exchangeRateRepository.invalidate(id);
    },
  };
}

export const exchangeRateService = createExchangeRateService(bcvTodayProvider);
