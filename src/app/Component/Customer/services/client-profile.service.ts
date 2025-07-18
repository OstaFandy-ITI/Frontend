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
  AddAddressResponse,
  ClientQuote,
  CreateReviewRequest,
  ReviewResponse
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

  getClientQuotes(clientId: number): Observable<ApiResponse<ClientQuote[]>> {
    return this.http.get<ApiResponse<ClientQuote[]>>(
      `${this.baseUrl}/GetClientQuotes/${clientId}`,
      this.getHttpOptions()
    );
  }

  // Geolocation service methods
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied by user.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred while retrieving location.'));
              break;
          }
        },
        options
      );
    });
  }

  // Reverse geocoding to get address from coordinates
  reverseGeocode(lat: number, lng: number): Observable<any> {
    // Using a free geocoding service (you can replace with your preferred service)
    const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    
    return this.http.get(geocodeUrl);
  }

  // Get address suggestions based on text input
  getAddressSuggestions(query: string): Observable<any> {
    // Using a free geocoding service for address suggestions
    const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=YOUR_MAPBOX_TOKEN&limit=5`;
    
    // Note: You'll need to replace with your actual geocoding service
    // For now, returning a mock response structure
    return this.http.get(searchUrl);
  }

  createReview(reviewData: CreateReviewRequest): Observable<ApiResponse<ReviewResponse>> {
  return this.http.post<ApiResponse<ReviewResponse>>(
    `${URL.apiUrl}/Review`,
    reviewData,
    this.getHttpOptions()
  );
}
}