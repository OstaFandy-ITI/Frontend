import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private currentBookingData: any = null;

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
