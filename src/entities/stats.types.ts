export interface DateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesByPeriodFilter extends DateRangeFilter {
  groupBy: "day" | "week" | "month";
}

export interface TopNFilter extends DateRangeFilter {
  limit: number;
}
