export interface JobAssignment {
  jobAssignmentId: number;
  clientName: string;
  clientNumber: string;
  address: string;
  status: string;
}

export interface AllJobsResponse {
  data: JobAssignment[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface UpdateStatusResponse {
  message: string;
}

export interface AddQuoteRequest {
  jobId: number;
  price: number;
  notes: string;
}

export interface AddQuoteResponse {
  message: string;
}
