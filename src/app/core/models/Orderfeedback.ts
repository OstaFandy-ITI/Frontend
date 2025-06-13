export interface OrderFeedback {
  bookingId: number;
  handymanName: string;
  handymanSpecialty: string;
  clientName: string;
  serviceName: string;
  rating: number;
  comment: string;
  completedAt: string | null;
  reviewCreatedAt: string;
  totalAmount: number;
}

export interface OrderFeedbackResponse {
  data: OrderFeedback[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface OrderFeedbackFilters {
  searchString?: string;
  serviceFilter?: string;
  ratingFilter?: number;
  pageNumber?: number;
  pageSize?: number;
}

