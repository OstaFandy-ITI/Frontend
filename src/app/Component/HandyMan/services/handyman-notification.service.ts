import { Injectable, NgZone  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL } from '../../../core/Shared/URL';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../../../core/services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class HandymanNotificationService {
private hubConnection: signalR.HubConnection | null = null;
  private hubUrl: string;
  private handymanUserId: number = 0;
  private notifications: string[] = [];
  constructor(private http: HttpClient, private authService: AuthService) {
    this.hubUrl = `${URL.apiUrl.replace('/api', '')}/notificationHub`;
    this.handymanUserId = this.authService.getCurrentUserId() ?? 0;
  }

  public startConnection(handymanUserId: number): void {
    if (this.hubConnection) {
      console.warn('Handyman notification connection already established');
      return;
    }
const token = this.authService.getToken();
  
  if (!token) {
    console.error('No authentication token found');
    return;
  }
 
    this.hubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${this.hubUrl}?userId=${handymanUserId}`, {
    accessTokenFactory: () => token
  })
  .withAutomaticReconnect()
  .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connected for handyman:', handymanUserId);
      })
      .catch(err => {
        console.error('Error while starting SignalR connection for handyman:', err);
      });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
      console.log('SignalR connection stopped');}
  }

  public onHandymanNotification(callback: (message: string) => void): void {
    if (!this.hubConnection) {
      console.error('Hub connection not established');
      return;
    }

    this.hubConnection.on('ReceiveNotificationhandyman', (messageOrUserId: string, message?: string) => {      
      
      if (message) {
         const userId = parseInt(messageOrUserId);
      if (userId === this.handymanUserId) {
        callback(message);
      }
      } else {
        callback(messageOrUserId);
      }
    });
  }

 GetNotificationsOfHandyman(handymanUserId: number)
 {

    return this.http.get<any[]>(`${URL.apiUrl}/HandymanJobs/GetNotificationsOfHandyman/${handymanUserId}`);
 }
}