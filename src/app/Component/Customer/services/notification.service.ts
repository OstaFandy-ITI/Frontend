import { Notification } from './../../../core/models/notification.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {  QuoteDetails, QuoteResponseDTO } from '../../../core/models/notification.model';
import { URL } from '../../../core/Shared/URL';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${URL.apiUrl}`;
private hubConnection!: signalR.HubConnection;
 private readonly hubUrl: string;
  constructor(private http: HttpClient) { 
    this.hubUrl = `${URL.apiUrl.replace('/api', '')}/notificationHub` 
  }


public startConnection(userId: number): void {
    if (this.hubConnection) {
        console.warn('Connection already established');
        return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.hubUrl}?userId=${userId}`)
        .withAutomaticReconnect()
        .build();

    this.hubConnection
        .start()
        .then(() => {
            console.log('SignalR connected for user:', userId);
        })
        .catch(err => {
            console.error('Error while starting SignalR connection:', err);
        });
}

//  public onQuoteUpdate(callback: (data: any) => void): void {
//     this.hubConnection?.on('ReceiveNotification', callback);
// }

public onJobUpdate(callback: (jobId: number, status: string) => void): void {
    this.hubConnection?.on('ReceiveJobStatusUpdate', callback);
}

// public onQuoteResponse(callback: (quoteId: number, action: string) => void): void {
//     this.hubConnection?.on('ReceiveQuoteResponse', callback);
// }

public stopConnection(): void {
    if (this.hubConnection) {
        this.hubConnection.stop();
        this.hubConnection = null as any;
    }
}
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

  // approveQuoteStatus(jobId: number, approvedStatus: string, clientUserId: number): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/ClientPage/new/ApproveQuoteStatusChange`, null, {
  //     params: {
  //       jobId: jobId.toString(),
  //       approvedStatus: approvedStatus,
  //       clientUserId: clientUserId.toString()
  //     }
  //   });
  // }
  
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/new/MarkAsRead/${notificationId}`, {});
  }

// processQuoteResponse(quoteResponse: QuoteResponseDTO): Observable<any> {
//     console.log('Processing quote response:', quoteResponse);
    
//     return this.http.post(`${this.baseUrl}/HandymanJobs/quote-response`, quoteResponse).pipe(
//         map(response => {
//             console.log('Quote response result:', response);
//             return response;
//         })
//     );
// }

// getQuoteByJobId(jobId: number): Observable<any> {
//     console.log('Fetching quote details for job ID:', jobId);
//     return this.http.get<any>(`${this.baseUrl}/HandymanJobs/quote-details/${jobId}`).pipe(
//         map(quote => {
//             console.log('Received quote data:', quote);
//             return quote;
//         })
//     );
// }

// getAvailableTimeSlots(handymanId: number, date: Date, estimatedMinutes: number): Observable<any[]> {
//     const params = {
//         handymanId: handymanId.toString(),
//         day: date.toISOString(),
//         estimatedMinutes: estimatedMinutes.toString()
//     };
//     console.log('Fetching time slots with params:', params);
//     return this.http.get<any[]>(`${this.baseUrl}/ClientPage/GetAvailableTimeSlotForHandyman`, {
//         params: params
//     }).pipe(
//         map(slots => {
//             console.log('Received time slots:', slots);
//             return slots || [];
//         })
//     );
// }
}
