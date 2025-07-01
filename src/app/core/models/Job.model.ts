export interface Job {
  jobAssignmentId: number;
  clientName: string;
  clientNumber: string;
  address: string;
  status: string;
}

export interface JobApiResponse {
  data: Job[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface JobsFilterParams {
  searchString?: string;
  pageNumber: number;
  pageSize: number;
  status?: string;
  handymanId: number;
}