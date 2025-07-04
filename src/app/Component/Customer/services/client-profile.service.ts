import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL'; 
import { 
  ClientProfile, 
  UpdateClientProfileRequest, 
  ClientOrderHistory, 
  ApiResponse,
  AddAddressRequest,
  AddAddressResponse
} from '../../../core/models/ClientProfile.model';

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private baseUrl = `${URL.apiUrl}/ClientProfile`;
  private addressUrl = `${URL.apiUrl}/Address`;

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

  addAddress(addressData: AddAddressRequest): Observable<ApiResponse<AddAddressResponse>> { 
    return this.http.post<ApiResponse<AddAddressResponse>>( 
      `${this.addressUrl}/CreateAddress`,
      addressData,
      this.getHttpOptions()
    );
  }

  getClientOrderHistory(clientId: number): Observable<ApiResponse<ClientOrderHistory>> {
    return this.http.get<ApiResponse<ClientOrderHistory>>(
      `${this.baseUrl}/GetClientOrderHistory/${clientId}`,
      this.getHttpOptions()
    );
  }

  
}