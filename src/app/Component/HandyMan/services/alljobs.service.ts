import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class AlljobsService {
  private baseUrl = 'https://localhost:7187/api';

  constructor(private http: HttpClient) { }

  getAllJobs(
    handymanId: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    status?: string,
    searchString?: string
  ): Observable<AllJobsResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('handymanId', handymanId.toString());

    if (status && status !== '') {
      params = params.set('status', status);
    }

    if (searchString && searchString.trim() !== '') {
      params = params.set('searchString', searchString.trim());
    }

    return this.http.get<AllJobsResponse>(`${this.baseUrl}/HandymanJobs`, { params });
  }

  updateJobStatus(jobId: number, newStatus: string): Observable<UpdateStatusResponse> {
    const url = `${this.baseUrl}/HandymanJobs/${jobId}`;
    const body = JSON.stringify(newStatus);

    return this.http.put<UpdateStatusResponse>(url, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addQuote(quoteData: AddQuoteRequest): Observable<AddQuoteResponse> {
    const url = `${this.baseUrl}/HandymanJobs/quote`;
    
    return this.http.post<AddQuoteResponse>(url, quoteData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}