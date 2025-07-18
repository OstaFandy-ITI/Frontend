import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL';
import { 
  AdminHandyManDTO, 
  CreateHandymanDTO, 
  EditHandymanDTO, 
  HandymanStatusUpdateDTO,
  PaginatedResponse,
  ApiResponse
} from '../../../core/models/Adminhandyman.model';

@Injectable({
  providedIn: 'root'
})
export class HandymanService {
    private baseUrl = `${URL.apiUrl}/AdminHandyMan`;
  

  constructor(private http: HttpClient) {}

    getAllHandymen(searchString: string = '', pageNumber: number = 1, pageSize: number = 5, isActive?: boolean | null): Observable<PaginatedResponse<AdminHandyManDTO>> {
      let params = new HttpParams()
        .set('searchString', searchString)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());
    if (isActive !== null && isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }
      return this.http.get<PaginatedResponse<AdminHandyManDTO>>(`${this.baseUrl}`, { params });
    }

  getPendingHandymen(): Observable<ApiResponse<AdminHandyManDTO[]>> {
    return this.http.get<ApiResponse<AdminHandyManDTO[]>>(`${this.baseUrl}/pending`);
  }

  getHandymanById(id: number): Observable<AdminHandyManDTO> {
    return this.http.get<AdminHandyManDTO>(`${this.baseUrl}/${id}`);
  }

  createHandyman(handyman: CreateHandymanDTO): Observable<AdminHandyManDTO> {
    return this.http.post<AdminHandyManDTO>(`${this.baseUrl}`, handyman);
  }

  
    updateHandymanStatus(userId: number, status: 'Active' | 'Inactive'): Observable<any> {
    const statusUpdate: HandymanStatusUpdateDTO = {
      userId: userId,
      status: status
    };
    
    return this.http.put(`${this.baseUrl}/status/${userId}`, statusUpdate);
  }
  
  updateHandyman(userId: number, handyman: EditHandymanDTO): Observable<AdminHandyManDTO> {
    return this.http.put<AdminHandyManDTO>(`${this.baseUrl}/${userId}`, handyman);
  }

  deleteHandyman(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  getSpecializations(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/specializations`)
}
} 
