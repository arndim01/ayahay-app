export interface PaginatedRequest {
  page: number;
}

export interface PaginatedResponse<T> {
  total: number;
  data: T[];
}
