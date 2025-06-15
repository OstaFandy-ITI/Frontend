export interface Category {
  id: number;
  name: string;
  description: string;
  iconImg?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  totalItems: number;
  items: T[];
  pageNumber: number;
  pageSize: number;
}
export interface Category {
  id: number;
  name: string;
  description: string;
  iconImg?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  totalItems: number;
  items: T[];
  pageNumber: number;
  pageSize: number;
}
