export class HandymanApplication {
  constructor(
    public email?: string,
    public firstname?: string,
    public lastname?: string,
    public phone?: string,
    public password?: string,
    public confirmpassword?: string,
    //handyman part
    public SpecializationId?: number,
    public Latitude?: number,
    public Longitude?: number,
    public NationalId?: string,
    public NationalIdImg?: File,
    public Img?: File,
    public ExperienceYears?: number,
    //address part
    public Address?: string,
    public City?: string,
    public AddressType?: string,
    public IsDefault?: boolean
  ) {}
}

// handyman-alljobs

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


//handyman-quotes
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