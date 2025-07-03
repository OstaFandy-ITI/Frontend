// services/client-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL'; 
import { 
  ClientProfile, 
  UpdateClientProfileRequest, 
  ChangePasswordRequest, 
  ClientOrderHistory, 
  ApiResponse 
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
  ): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
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

 
  changePassword(
    clientId: number,
    passwordData: ChangePasswordRequest
  ): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.baseUrl}/ChangePassword/${clientId}`,
      passwordData,
      this.getHttpOptions()
    );
  }

  

}