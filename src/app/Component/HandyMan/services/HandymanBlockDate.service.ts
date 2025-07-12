import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  HandymanBlockDateDTO, 
  ApplyBlockDateRequest, 
  BlockDatePaginationResponse,
  HandymanInfo 
} from '../../../core/models/BlockDateForHandyman.model';
import{URL} from '../../../core/Shared/URL'

@Injectable({
  providedIn: 'root'
})
export class HandymanBlockDateService {
  private apiUrl = `${URL.apiUrl}/HandymanJobs`;

  constructor(private http: HttpClient) {}


  applyForBlockDate(request: ApplyBlockDateRequest): Observable<any> {
    const params = new HttpParams()
      .set('HandymanId', request.handymanId.toString())
      .set('Reason', request.reason)
      .set('StartDate', request.startDate)
      .set('EndDate', request.endDate);
    
    return this.http.post(`${this.apiUrl}/ApplyForBlockDate`, null, { 
      params: params,
      responseType: 'text' 
    });
  }

   getHandymanBlockDate(
    handymanId: number,
    pageNumber: number = 1,
    pageSize: number = 5,
    status?: string,
    date?: string
  ): Observable<BlockDatePaginationResponse> {
    let params = new HttpParams()
      .set('handymanId', handymanId.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchString', ''); 

    if (status) {
      params = params.set('status', status);
    }
    
    if (date) {
      params = params.set('Date', date);
    }

    return this.http.get<BlockDatePaginationResponse>(`${this.apiUrl}/GetHandymanBlockDate`, { params });
  }
}