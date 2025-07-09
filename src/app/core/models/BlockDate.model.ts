export interface HandymanSummaryDTO {
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  specializationId: number;
  status?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface BlockDateDTO {
  userId: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
  email: string;
  name: string;
  phone: string;
}

export interface PaginationHelper<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface AddBlockDateRequest {
  handymanId: number;
  reason: string;
  startDate: string;
  endDate: string;
}