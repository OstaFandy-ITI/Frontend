import { CreateBookingVM } from './../../../core/models/Booking.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { Observable } from 'rxjs';
import { ResponseDto } from '../../../core/models/Response.model';
import { slots } from '../../../core/models/Booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private currentBookingData: any = null;

  private BaseUrl = `${URL.apiUrl}/Booking`;
  constructor(private http: HttpClient) {}

  setBooking(data: any) {
    this.currentBookingData = data;
  }

  getCurrentBooking(): any {
    return this.currentBookingData;
  }

  getChatId(): number | null {
    return this.currentBookingData?.chat?.id ?? null;
  }

  ///api/Booking/FreeSlot
  getFreeSlot(
    categoryId: number,
    day: string,
    userLatitude: number,
    userLongitude: number,
    estimatedMinutes: number
  ): Observable<ResponseDto<slots[]>> {
    const params = {
      categoryId,
      day,
      userLatitude,
      userLongitude,
      estimatedMinutes,
    };

    return this.http.get<ResponseDto<slots[]>>(`${this.BaseUrl}/FreeSlot`, {
      params,
    });
  }

  ///api/Booking/createbooking
  createBooking(booking: CreateBookingVM):Observable<ResponseDto<any>> {
    return this.http.post<ResponseDto<any>>(`${this.BaseUrl}/createbooking`, booking);
  }
}
