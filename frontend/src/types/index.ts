// Re-export types from client API for convenience
export type { User } from '../client-api/client';

// Add additional shared types here as your app grows
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
