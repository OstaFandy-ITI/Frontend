import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceItem, PaginatedResult, ServiceCreateDTO, ServiceUpdateDTO } from '../../../core/models/service.models';
import { URL } from '../../../core/Shared/URL';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = `${URL.apiUrl}/Service`;
    private apiUrl2 = `${URL.apiUrl}/Category`;


  constructor(private http: HttpClient) {}

  getPaginated(
    pageNumber: number,
    pageSize: number,
    search: string,
    status: string,
    sortField?: string,
    sortOrder?: string,
    categoryId?: number | null
  ): Observable<PaginatedResult<ServiceItem>> {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'All') query += `&status=${status}`;
    if (sortField) query += `&sortField=${sortField}`;
    if (sortOrder) query += `&sortOrder=${sortOrder}`;
    if (categoryId) query += `&categoryId=${categoryId}`;

    return this.http.get<PaginatedResult<ServiceItem>>(`${this.apiUrl}/paginated${query}`);
  }

  add(service: ServiceCreateDTO): Observable<void> {
    return this.http.post<void>(this.apiUrl, service);
  }

  update(service: ServiceUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${service.id}`, service);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}, { responseType: 'text' as 'json' });
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.apiUrl2}`);
  }
}
