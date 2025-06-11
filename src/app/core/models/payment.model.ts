// models/payment.models.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface PaymentFilterDto {
  status?: string;
  method?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PaymentDto {
  id: number;
  clientName: string;
  bookingId: number;
  amount: number;
  method: string;
  status: string;
  date: string;
}

export interface PaymentDetailsDto {
  id: number;
  clientName: string;
  bookingId: number;
  amount: number;
  method: string;
  status: string;
  paymentIntentId: string | null;
  receipt: string | null;
  date: string;
}

export interface PagedPaymentResponseDto {
  data: PaymentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}