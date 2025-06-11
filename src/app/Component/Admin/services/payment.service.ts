// Component/Admin/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ApiResponse, 
  PaymentFilterDto, 
  PagedPaymentResponseDto, 
  PaymentDetailsDto 
} from '../../../core/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'https://localhost:7187/api/Payment';

  constructor(private http: HttpClient) {}

  getAllPayments(filter: PaymentFilterDto): Observable<ApiResponse<PagedPaymentResponseDto>> {
    let params = new HttpParams();
    
    if (filter.status) params = params.set('status', filter.status);
    if (filter.method) params = params.set('method', filter.method);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    params = params.set('pageNumber', filter.pageNumber.toString());
    params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<ApiResponse<PagedPaymentResponseDto>>(this.baseUrl, { params });
  }

  getPaymentById(id: number): Observable<ApiResponse<PaymentDetailsDto>> {
    return this.http.get<ApiResponse<PaymentDetailsDto>>(`${this.baseUrl}/${id}`);
  }
}