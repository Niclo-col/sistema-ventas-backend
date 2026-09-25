/**
 * Abstracción de la fuente de tasas de cambio. El service de ExchangeRate
 * depende de esta interfaz, nunca de una implementación concreta — así se
 * puede cambiar de proveedor (u ofrecer varios) sin tocar la lógica de
 * negocio ni el resto del sistema.
 */
export interface ExchangeRateProviderResult {
  rate: string; // decimal como string, para no perder precisión
  sourceCurrency: string;
  targetCurrency: string;
  effectiveAt: Date;
  source: string;
}

export interface ExchangeRateProvider {
  fetchLatestRate(): Promise<ExchangeRateProviderResult>;
}
