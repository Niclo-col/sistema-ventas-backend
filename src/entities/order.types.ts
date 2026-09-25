export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  customerId?: string;
  items: CreateOrderItemDTO[];
}

export interface ListOrderFilters {
  status?: "COMPLETED" | "CANCELLED";
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}
