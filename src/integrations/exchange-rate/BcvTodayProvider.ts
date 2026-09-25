import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { ExchangeRateProvider, ExchangeRateProviderResult } from "./ExchangeRateProvider";

const BCV_TODAY_URL = "https://bcv.today/api/v1/rate.json";

// Forma real del payload de bcv.today (verificado contra la API en vivo):
// { "USD": 853.4993, "EUR": ..., "updated_at": "...", "effective_date": "...", "date": "..." }
interface BcvTodayPayload {
  USD: number;
  updated_at: string;
  effective_date: string;
  [currency: string]: unknown;
}

export class ExchangeRateProviderError extends AppError {
  constructor(message = "El proveedor externo de tasas de cambio no está disponible") {
    super(message, 502, "EXCHANGE_RATE_PROVIDER_ERROR");
  }
}

export class BcvTodayProvider implements ExchangeRateProvider {
  async fetchLatestRate(): Promise<ExchangeRateProviderResult> {
    let response: Response;

    try {
      response = await fetch(BCV_TODAY_URL, { signal: AbortSignal.timeout(8000) });
    } catch (err) {
      logger.error({ err }, "Fallo de red consultando bcv.today");
      throw new ExchangeRateProviderError();
    }

    if (!response.ok) {
      logger.error({ status: response.status }, "bcv.today respondió con error");
      throw new ExchangeRateProviderError();
    }

    const payload = (await response.json()) as BcvTodayPayload;

    if (typeof payload.USD !== "number" || !payload.updated_at) {
      logger.error({ payload }, "Payload de bcv.today con formato inesperado");
      throw new ExchangeRateProviderError("El proveedor externo devolvió un formato inesperado");
    }

    return {
      rate: payload.USD.toString(),
      sourceCurrency: "USD",
      targetCurrency: "VES",
      effectiveAt: new Date(payload.updated_at),
      source: "bcv.today",
    };
  }
}

export const bcvTodayProvider = new BcvTodayProvider();
