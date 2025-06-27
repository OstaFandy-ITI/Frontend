import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import{URL} from '../../../core/Shared/URL'
import { Observable } from 'rxjs';
import { BookingViewModel } from '../../../core/models/Booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
private baseUrl = `${URL.apiUrl}/Booking`;
  constructor(private http:HttpClient) { }

    //get handyman booking /api/Booking/GetBookingsByHandyManId/{handyManId}
  getHandymanBooking(handyManId:number):Observable<any>{
    return this.http.get(`${this.baseUrl}/GetBookingsByHandyManId/${handyManId}`) ;
  }
}
