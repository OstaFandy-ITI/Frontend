import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { map, Observable } from 'rxjs';
import { Notification } from '../../../core/models/AdminNotification.model';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
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

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null as any;
    }
  }

  public onVacationUpdate(callback: (jobId: number, status: string) => void): void {
    this.hubConnection?.on('ReceiveNotificationhandyman', callback);
  }

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/AdminHandyMan/GetNotificationsOfAdmin/${userId}`);
  }

  rejectBlockDate(handymanId: number, reason: string, startDate: string, endDate: string): Observable<any> {
    const params = {
      HandymanId: handymanId,
      Reason: reason,
      StartDate: startDate,
      EndDate: endDate
    };
    
    return this.http.put(`${this.baseUrl}/AdminHandyMan/RejectBlockDate`, null, { params });
  }

  approveBlockDate(handymanId: number, reason: string, startDate: string, endDate: string): Observable<any> {
    const params = {
      HandymanId: handymanId,
      Reason: reason,
      StartDate: startDate,
      EndDate: endDate
    };
    
    return this.http.put(`${this.baseUrl}/AdminHandyMan/ApproveBlockDate`, null, { params });
  }
}