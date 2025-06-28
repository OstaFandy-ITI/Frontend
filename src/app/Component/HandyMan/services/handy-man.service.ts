import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import{URL} from '../../../core/Shared/URL'

@Injectable({
  providedIn: 'root'
})
export class HandyManService {

  private baseUrl = `${URL.apiUrl}/HandyMan`;
  constructor(private http:HttpClient) { }

  //get handyman Statistics /api/HandyMan/GetHandyManStats
  getHandymanStatistics(id:number): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetHandyManStats/${id}`);
  }


}
