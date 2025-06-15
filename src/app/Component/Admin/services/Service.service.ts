import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ServiceItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  totalItems: number;
  items: T[];
  pageNumber: number;
  pageSize: number;
}

export interface ServiceUpdateDTO {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
}

export type ServiceCreateDTO = {
  categoryId: number;
  name: string;
  description?: string;
  fixedPrice: number;
  estimatedMinutes: number;
  serviceType: string;
  isActive: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = 'https://localhost:7187/api/Service';

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
    return this.http.get<{ id: number; name: string }[]>('https://localhost:7187/api/Category');
  }
}
