import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL';
import { 
  HandymanProfile,
  UpdateHandymanProfilePhotoResponse,
  UpdateHandymanProfileRequest,
  ApiResponse
} from '../../../core/models/HandymanProfile.model';

@Injectable({
  providedIn: 'root'
})
export class HandymanProfileService {
  private baseUrl = `${URL.apiUrl}/HandymanProfile`;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  private getHttpOptionsForFile() {
    return {
      headers: new HttpHeaders({})
    };
  }

  getHandymanProfile(handymanId: number): Observable<HandymanProfile> {
    return this.http.get<HandymanProfile>(
      `${this.baseUrl}/${handymanId}`,
      this.getHttpOptions()
    );
  }

  updateHandymanProfile(handymanId: number, updateData: UpdateHandymanProfileRequest): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${handymanId}`,
      updateData,
      this.getHttpOptions()
    );
  }


  updateHandymanProfilePhoto(handymanId: number, profilePhoto: File): Observable<UpdateHandymanProfilePhotoResponse> {
    const formData = new FormData();
    formData.append('profilePhoto', profilePhoto);

    return this.http.patch<UpdateHandymanProfilePhotoResponse>(
      `${this.baseUrl}/${handymanId}/profile-photo`,
      formData
    );
  }
}