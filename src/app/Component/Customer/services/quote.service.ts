import { Injectable } from '@angular/core';
import {  QuoteDetails, QuoteResponseDTO } from '../../../core/models/notification.model';
import { URL } from '../../../core/Shared/URL';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private baseUrl = `${URL.apiUrl}`;
  private hubConnection!: signalR.HubConnection;
  private readonly hubUrl: string;

  constructor(private http: HttpClient) {
    this.hubUrl = `${URL.apiUrl.replace('/api', '')}/notificationHub`;
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
  
   public onQuoteUpdate(callback: (data: any) => void): void {
      this.hubConnection?.on('ReceiveNotification', callback);
  }
  public onQuoteResponse(callback: (quoteId: number, action: string) => void): void {
    this.hubConnection?.on('ReceiveQuoteResponse', callback);
}

public stopConnection(): void {
    if (this.hubConnection) {
        this.hubConnection.stop();
        this.hubConnection = null as any;
    }
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
}

}
