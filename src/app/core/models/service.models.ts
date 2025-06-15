export interface ServiceItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  totalItems: number;
  items: T[];
  pageNumber: number;
  pageSize: number;
}

export interface ServiceUpdateDTO {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
}

export type ServiceCreateDTO = {
  categoryId: number;
  name: string;
  description?: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
};
