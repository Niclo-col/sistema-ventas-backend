export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ListCategoryFilters {
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  page: number;
  pageSize: number;
}
