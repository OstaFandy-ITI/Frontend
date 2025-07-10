import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL } from '../../../core/Shared/URL';
import {
  AllJobsResponse,
  UpdateStatusResponse,
  AddQuoteRequest,
  AddQuoteResponse,
  JobAssignment
} from '../../../core/models/Handyman.model';
import * as signalR from '@microsoft/signalr';


@Injectable({
  providedIn: 'root'
})
export class AlljobsService {
  // private baseUrl = 'https://localhost:7187/api';
  private baseUrl = `${URL.apiUrl}`; 
  private readonly hubUrl: string;
  private hubConnection!: signalR.HubConnection;
  private userId: number | null = null;
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



public stopConnection(): void {
    if (this.hubConnection) {
        this.hubConnection.stop();
        this.hubConnection = null as any;
    }
}
  getAllJobs(
    handymanId: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    status?: string,
    searchString?: string
  ): Observable<AllJobsResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('handymanId', handymanId.toString());

    if (status && status !== '') {
      params = params.set('status', status);
    }

    if (searchString && searchString.trim() !== '') {
      params = params.set('searchString', searchString.trim());
    }

    return this.http.get<AllJobsResponse>(`${this.baseUrl}/HandymanJobs`, { params });
  }

  updateJobStatus(jobId: number, newStatus: string): Observable<UpdateStatusResponse> {
    const url = `${this.baseUrl}/HandymanJobs/${jobId}`;
    const body = JSON.stringify(newStatus);

    return this.http.put<UpdateStatusResponse>(url, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addQuote(quoteData: AddQuoteRequest): Observable<AddQuoteResponse> {
    const url = `${this.baseUrl}/HandymanJobs/quote`;
    
    return this.http.post<AddQuoteResponse>(url, quoteData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}