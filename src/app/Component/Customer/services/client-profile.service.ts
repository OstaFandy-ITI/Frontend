import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL'; 
import { 
  ClientProfile, 
  UpdateClientProfileRequest, 
  ClientOrderHistory, 
  ApiResponse,
  ClientQuote,
  CreateReviewRequest,
  ReviewResponse
} from '../../../core/models/ClientProfile.model';

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private baseUrl = `${URL.apiUrl}/ClientProfile`;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getClientProfile(clientId: number): Observable<ApiResponse<ClientProfile>> {
    return this.http.get<ApiResponse<ClientProfile>>(
      `${this.baseUrl}/GetClientProfile/${clientId}`,
      this.getHttpOptions()
    );
  }

  updateClientProfile(
    clientId: number, 
    profileData: UpdateClientProfileRequest
  ): Observable<ApiResponse<ClientProfile>> {
    return this.http.put<ApiResponse<ClientProfile>>(
      `${this.baseUrl}/UpdateClientProfile/${clientId}`,
      profileData,
      this.getHttpOptions()
    );
  }

  getClientOrderHistory(clientId: number): Observable<ApiResponse<ClientOrderHistory>> {
    return this.http.get<ApiResponse<ClientOrderHistory>>(
      `${this.baseUrl}/GetClientOrderHistory/${clientId}`,
      this.getHttpOptions()
    );
  }

  getClientQuotes(clientId: number): Observable<ApiResponse<ClientQuote[]>> {
    return this.http.get<ApiResponse<ClientQuote[]>>(
      `${this.baseUrl}/GetClientQuotes/${clientId}`,
      this.getHttpOptions()
    );
  }

  createReview(reviewData: CreateReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.http.post<ApiResponse<ReviewResponse>>(
      `${URL.apiUrl}/Review`,
      reviewData,
      this.getHttpOptions()
    );
  }

  // Note: Address-related methods have been moved to AddressService
  // This keeps the separation of concerns clean
}