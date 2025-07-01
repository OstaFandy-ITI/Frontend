// services/handyman-quotes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuotesResponse } from '../../../core/models/Handyman.model';
import { URL } from '../../../core/Shared/URL';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
    private baseUrl = `${URL.apiUrl}/HandymanJobs`;
  

  constructor(private http: HttpClient) { }

  getHandymanQuotes(handymanId: number, pageNumber: number = 1, pageSize: number = 10): Observable<QuotesResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchString', '');

    return this.http.get<QuotesResponse>(
      `${this.baseUrl}/quotes/${handymanId}`,
      { params }
    );
  }
}
