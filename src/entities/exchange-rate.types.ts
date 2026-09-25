export interface RegisterManualRateDTO {
  rate: string;
  sourceCurrency?: string; // default "USD"
  targetCurrency?: string; // default "VES"
  effectiveAt?: string; // ISO datetime, default ahora
}

export interface ListExchangeRateFilters {
  status?: "ACTIVE" | "INACTIVE";
  page: number;
  pageSize: number;
}
