import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Notification, QuoteDetails, QuoteResponseDTO } from '../../../core/models/notification.model';
import { URL } from '../../../core/Shared/URL';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${URL.apiUrl}`;
  constructor(private http: HttpClient) { }
// getNotifications(userId: number): Observable<Notification[]> {
//     return this.http.get<Notification[]>(`${this.baseUrl}/ClientPage/GetNotifications/${userId}`);
// }
  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/ClientPage/GetNotifications/${userId}`)
    .pipe(
            map(notifications => notifications.map(n => ({
                ...n,
                relatedEntityId: n.relatedEntityId || n.relatedEntityId,
                relatedEntityType: n.relatedEntityType || n.relatedEntityType
            } as Notification)))
        );
  }

  approveJobStatus(jobId: number, approvedStatus: string, clientUserId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/ClientPage/ApproveJobStatusChange`, null, {
      params: {
        jobId: jobId.toString(),
        approvedStatus: approvedStatus,
        clientUserId: clientUserId.toString()
      }
    });
  }

  approveQuoteStatus(jobId: number, approvedStatus: string, clientUserId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/ClientPage/new/ApproveQuoteStatusChange`, null, {
      params: {
        jobId: jobId.toString(),
        approvedStatus: approvedStatus,
        clientUserId: clientUserId.toString()
      }
    });
  }
  
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/new/MarkAsRead/${notificationId}`, {});
  }

processQuoteResponse(quoteResponse: QuoteResponseDTO): Observable<any> {
    console.log('Processing quote response:', quoteResponse);
    
    return this.http.post(`${this.baseUrl}/HandymanJobs/quote-response`, quoteResponse).pipe(
        map(response => {
            console.log('Quote response result:', response);
            return response;
        })
    );
}

getQuoteByJobId(jobId: number): Observable<any> {
    console.log('Fetching quote details for job ID:', jobId);
    return this.http.get<any>(`${this.baseUrl}/HandymanJobs/quote-details/${jobId}`).pipe(
        map(quote => {
            console.log('Received quote data:', quote);
            return quote;
        })
    );
}

getAvailableTimeSlots(handymanId: number, date: Date, estimatedMinutes: number): Observable<any[]> {
    const params = {
        handymanId: handymanId.toString(),
        day: date.toISOString(),
        estimatedMinutes: estimatedMinutes.toString()
    };
    console.log('Fetching time slots with params:', params);
    return this.http.get<any[]>(`${this.baseUrl}/ClientPage/GetAvailableTimeSlotForHandyman`, {
        params: params
    }).pipe(
        map(slots => {
            console.log('Received time slots:', slots);
            return slots || [];
        })
    );
}}
