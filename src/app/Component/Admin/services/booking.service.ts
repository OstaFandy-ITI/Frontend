import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

   private BaseUrl = `${URL.apiUrl}/Booking`;
  constructor(private http:HttpClient) { }

  ///api/Booking/GetAllBookings
  GetAllBookings(): Observable<any> {
    return this.http.get(`${this.BaseUrl}/GetAllBookings`);
  }
}
