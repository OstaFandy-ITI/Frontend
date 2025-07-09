export interface HandymanBlockDateDTO {
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export interface ApplyBlockDateRequest {
  handymanId: number;
  reason: string;
  startDate: string;
  endDate: string;
}

export interface BlockDatePaginationResponse {
  data: HandymanBlockDateDTO[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface HandymanInfo {
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}