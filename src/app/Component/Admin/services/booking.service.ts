import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  bookingFilterDto,
  BookingViewModel,
} from '../../../core/models/Booking.model';
import { PaginatedResult } from '../../../core/models/category.models';
import { BookingStatus } from '../../../core/Shared/Enum';
import { ResponseDto } from '../../../core/models/Response.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private BaseUrl = `${URL.apiUrl}/Booking`;
  constructor(private http: HttpClient) {}

  ///api/Booking/GetAllBookings
  GetAllBookings(): Observable<any> {
    return this.http.get(`${this.BaseUrl}/GetAllBookings`);
  }

  ///api/Booking/paged
  getPaginated(
    filter: bookingFilterDto
  ): Observable<PaginatedResult<BookingViewModel>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);
    if (filter.handymanName && filter.handymanName.trim() !== '') {
      params = params.set('handymanName', filter.handymanName.trim());
    }
    if (filter.status && filter.status.trim() !== '') {
      params = params.set('status', filter.status.trim());
    }

    if (filter.isActive !== null && filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }

    return this.http.get<PaginatedResult<BookingViewModel>>(
      `${this.BaseUrl}/paged`,
      { params }
    );
  }
  ///api/Booking/CancelBooking
  CancelBooking(BookingId: number) {
    return this.http.patch<ResponseDto<string>>(
      `${this.BaseUrl}/CancelBooking?bookingId=${BookingId}`,
      {}
    );
  }
}
