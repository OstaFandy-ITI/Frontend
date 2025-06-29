import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {URL} from '../../../core/Shared/URL'
import { Observable } from 'rxjs';
import { ServiceItem } from '../../../core/models/service.models';


@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private BaseUrl = `${URL.apiUrl}/Service`;
  constructor(private http:HttpClient) { }

 //by-category/{categoryId}
 GetServiceByCategoryId(categoryId:number):Observable<ServiceItem[]>
 {
    return this.http.get<ServiceItem[]>(`${this.BaseUrl}/by-category/${categoryId}`)
 }
}
