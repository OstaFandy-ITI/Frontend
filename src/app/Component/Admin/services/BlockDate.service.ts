
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { 
  HandymanSummaryDTO, 
  Category, 
  BlockDateDTO, 
  PaginationHelper, 
  AddBlockDateRequest 
} from '../../../core/models/BlockDate.model';
import { URL } from '../../../core/Shared/URL'; 
// import { url } from 'node:inspector/promises';

@Injectable({
  providedIn: 'root'
})
export class HandymanBlockDateService {
  
    private baseUrl = `${URL.apiUrl}/AdminHandyMan`;
  
  constructor(private http: HttpClient) { }

   getAllHandymanData(
    searchString: string = '', 
    pageNumber: number = 1, 
    pageSize: number = 5, 
    categoryId?: number
  ): Observable<PaginationHelper<HandymanSummaryDTO>> {
    let params = new HttpParams()
      .set('searchString', searchString)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (categoryId && categoryId > 0) {
      params = params.set('categoryId', categoryId.toString());
  }
    return this.http.get<PaginationHelper<HandymanSummaryDTO>>(
      `${this.baseUrl}/GetAllHandymanData`, 
      { params }
    );
  }
  getCategoriesForDropdown(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/GetCategoriesForDropdown`);
  }
  getAllBlockDates(
    searchString: string = '',
    pageNumber: number = 1,
    pageSize: number = 5,
    status?: string,
    date?: string
  ): Observable<PaginationHelper<BlockDateDTO>> {
    let params = new HttpParams()
      .set('searchString', searchString)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<PaginationHelper<BlockDateDTO>>(
      `${this.baseUrl}/blockdates`, 
      { params }
    );
  }

  addBlockDate(request: AddBlockDateRequest): Observable<string> {
    let params = new HttpParams()
      .set('HandymanId', request.handymanId.toString())
      .set('Reason', request.reason)
      .set('StartDate', request.startDate)
      .set('EndDate', request.endDate);

    return this.http.post(`${this.baseUrl}/AddBlockDate`, null, { 
    params: params,
    responseType: 'text' 
  });
}
}