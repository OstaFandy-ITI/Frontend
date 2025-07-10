import { Notification } from './../../../core/models/notification.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {  QuoteDetails, QuoteResponseDTO } from '../../../core/models/notification.model';
import { URL } from '../../../core/Shared/URL';
import * as signalR from '@microsoft/signalr';  
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${URL.apiUrl}`;
private hubConnection!: signalR.HubConnection;
 private readonly hubUrl: string;
  constructor(private http: HttpClient, private authService: AuthService) { 
    this.hubUrl = `${URL.apiUrl.replace('/api', '')}/notificationHub` 
  }


public startConnection(userId: number): void {
  const token = this.authService.getToken();
  if (!token) {
      console.error('No authentication token found');
      return;
    }
    if (this.hubConnection) {
        console.warn('Connection already established');
        return;
    }
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}`, {
        accessTokenFactory: () => token
      })
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
public onJobUpdate(callback: (jobId: number, status: string) => void): void {
    this.hubConnection?.on('ReceiveJobStatusUpdate', callback);
}


public onQuoteResponse(callback: (quoteId: number, action: string, message: string) => void): void {
    if (!this.hubConnection) return;
    this.hubConnection?.on('ReceiveQuoteResponse', callback);
}
public onQuoteNotification(callback: (message: string) => void): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveNotificationClient', (message: string) => {
      callback(message);
    });
  }

public stopConnection(): void {
    if (this.hubConnection) {
        this.hubConnection.stop();
        this.hubConnection = null as any;
    }
}
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
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/new/MarkAsRead/${notificationId}`, {});
  }
}
