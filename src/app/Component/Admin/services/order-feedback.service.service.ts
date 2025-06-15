// services/order-feedback.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderFeedbackResponse, OrderFeedbackFilters } from '../../../core/models/Orderfeedback';
import { URL } from '../../../core/Shared/URL';
 
@Injectable({
  providedIn: 'root'
})
export class OrderFeedbackService {
  private apiUrl = `${URL.apiUrl}/OrdersFeedback`;

  constructor(private http: HttpClient) {}

  getAllOrdersFeedback(filters: OrderFeedbackFilters = {}): Observable<OrderFeedbackResponse> {
    let params = new HttpParams();
    
    if (filters.searchString && filters.searchString.trim()) {
      params = params.set('searchString', filters.searchString.trim());
    }
    if (filters.pageNumber) {
      params = params.set('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<OrderFeedbackResponse>(this.apiUrl, { params });
  }

  // Helper method to get unique services for filter dropdown
  getUniqueServices(feedbacks: any[]): string[] {
    const services = feedbacks.map(f => f.serviceName);
    return [...new Set(services)];
  }

  // Helper method to get star rating array
  getStarRating(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}