import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AdminDisplayClientDTO, 
  AdminEditClientDTO, 
  ClientListResponse, 
  ClientDetailResponse,
  ClientSearchParams 
} from '../../../core/models/client.models';
import { URL } from '../../../core/Shared/URL';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${URL.apiUrl}/AdminClient`;

  constructor(private http: HttpClient) { }

  getAllClients(params: ClientSearchParams = {}): Observable<ClientListResponse> {
    let httpParams = new HttpParams();
    
    if (params.searchString) {
      httpParams = httpParams.set('searchString', params.searchString);
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.isActive !== null && params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }

    return this.http.get<ClientListResponse>(this.apiUrl, { params: httpParams });
  }

  getClientById(id: number): Observable<ClientDetailResponse> {
    return this.http.get<ClientDetailResponse>(`${this.apiUrl}/${id}`);
  }

  updateClient(clientData: AdminEditClientDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/EditClient?id=${clientData.id}`, clientData);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   getClientBookings(clientId: number, searchString = '', pageNumber = 1, pageSize = 5): Observable<any> {
    const params = new HttpParams()
      .set('searchString', searchString)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiUrl}/${clientId}/bookings`, { params });
  }
}