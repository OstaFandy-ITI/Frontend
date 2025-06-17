import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { URL } from '../../../core/Shared/URL'; 
import {
  ServiceUsageStatsResponse,
  BookingLocationStatsResponse
} from '../../../core/models/Analytics'; 

@Injectable({
  providedIn: 'root' 
})

export class AnalyticsService {
  private BaseUrl = `${URL.apiUrl}/Analytics`;

  constructor(private http: HttpClient) { }

  getServiceUsageStats(): Observable<ServiceUsageStatsResponse> {
    return this.http.get<ServiceUsageStatsResponse>(`${this.BaseUrl}/service-usage-stats`).pipe(
      catchError(this.handleError)
    );
  }

  getBookingLocationStats(): Observable<BookingLocationStatsResponse> {
    return this.http.get<BookingLocationStatsResponse>(`${this.BaseUrl}/booking-location-stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Basic error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}