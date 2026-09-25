export interface CreateProductDTO {
  categoryId: string;
  name: string;
  description?: string;
  priceUsd: string; // string para preservar precisión decimal desde el request
}

export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  description?: string;
  priceUsd?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ListProductFilters {
  categoryId?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  page: number;
  pageSize: number;
}
