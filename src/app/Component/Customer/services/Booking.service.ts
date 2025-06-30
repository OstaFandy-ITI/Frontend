import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {URL} from '../../../core/Shared/URL'

@Injectable({ providedIn: 'root' })
export class BookingService {
  private currentBookingData: any = null;

  private BaseUrl = `${URL.apiUrl}/Booking`;
    constructor(private http: HttpClient) { }

  setBooking(data: any) {
    this.currentBookingData = data;
  }

  getCurrentBooking(): any {
    return this.currentBookingData;
  }

  getChatId(): number | null {
    return this.currentBookingData?.chat?.id ?? null;
  }

  
}
