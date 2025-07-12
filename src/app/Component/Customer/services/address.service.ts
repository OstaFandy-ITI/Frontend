import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { Observable, forkJoin, of } from 'rxjs';
import { AddressDTO, CreateAddressDTO } from '../../../core/models/Address.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseDto } from '../../../core/models/Response.model';
import { ApiResponse } from '../../../core/models/ClientProfile.model';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(private http: HttpClient) {}
  private BaseUrl = `${URL.apiUrl}/Address`;

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // Get addresses by user ID
  GetAddressesByUserId(UserId: number): Observable<AddressDTO[]> {
    console.log(`Getting addresses for user: ${UserId}`);
    
    return this.http.get<AddressDTO[]>(
      `${this.BaseUrl}/GetAddressesByUserId/${UserId}`,
      this.getHttpOptions()
    );
  }

  // Create new address
  CreateAddress(address: CreateAddressDTO): Observable<ResponseDto<string>> {
    console.log('Creating address:', address);
    
    return this.http.post<ResponseDto<string>>(
      `${this.BaseUrl}/CreateAddress`,
      address,
      this.getHttpOptions()
    );
  }

  // Update address
UpdateAddress(addressId: number, address: Partial<AddressDTO>): Observable<ApiResponse<AddressDTO>> {
  console.log(`Updating address ${addressId}:`, address);
  
  return this.http.put<ApiResponse<AddressDTO>>(
    `${this.BaseUrl}/UpdateAddress/${addressId}`,
    address,
    this.getHttpOptions()
  );
}

// set as default
SetDefaultAddress(addressId: number, userId: number): Observable<ApiResponse<null>> {
    console.log(`Setting address ${addressId} as default for user ${userId}`);
    
    return this.http.put<ApiResponse<null>>(
      `${this.BaseUrl}/SetDefaultAddress/${addressId}?userId=${userId}`,
      null,
      this.getHttpOptions()
    );
  }

  // Delete address
  DeleteAddress(addressId: number, userId: number): Observable<ApiResponse<null>> {
    console.log(`Deleting address ${addressId} for user ${userId}`);
    
    return this.http.delete<ApiResponse<null>>(
      `${this.BaseUrl}/DeleteAddress/${addressId}?userId=${userId}`,
      this.getHttpOptions()
    );
  }

  // Mark notification as read (this seems unrelated to addresses - might need to be moved)
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.BaseUrl}/MarkAsRead/${notificationId}`, null);
  }
}