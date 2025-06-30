export interface AllQuotes {
  jobAssignmentId: number;
  price: number;
  estimatedMinutes?: number;
  notes: string;
  status: string;
  createdAt: string;
}

export interface QuotesResponse {
  data: AllQuotes[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
  message?: string;
}