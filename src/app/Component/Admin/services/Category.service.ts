import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CategoryCreate, PaginatedResult } from '../../../core/models/category.models';  

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:7187/api/category';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getPaginated(pageNumber: number, pageSize: number, search = '', status = 'All'): Observable<PaginatedResult<Category>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('search', search)
      .set('status', status);

    return this.http.get<PaginatedResult<Category>>(`${this.apiUrl}/paginated`, { params });
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  add(category: CategoryCreate): Observable<any> {
    return this.http.post(this.apiUrl, category, this.getAuthHeaders());
  }

  update(category: Category): Observable<any> {
    return this.http.put(`${this.apiUrl}/${category.id}`, category, this.getAuthHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}, {
      ...this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
}
