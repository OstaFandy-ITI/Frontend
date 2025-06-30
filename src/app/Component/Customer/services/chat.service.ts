import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { ChatThread, MessageDTO } from '../../../core/models/message.model';
import { URL } from '../../../core/Shared/URL';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messageReceived = new Subject<MessageDTO>();

  constructor(private http: HttpClient) {}

  // Start SignalR connection and join chat group
  startConnection(chatId: number): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${URL.apiUrl.replace('/api', '')}/chatHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR connected');
        this.hubConnection.invoke('JoinChat', chatId.toString());
      })
      .catch(err => console.error('❌ SignalR error:', err));

    this.hubConnection.on('ReceiveMessage', (msg: MessageDTO) => {
      this.messageReceived.next(msg);
    });
  }

  // Stop SignalR connection and leave chat group
  stopConnection(chatId: number): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveChat', chatId.toString()).finally(() => {
        this.hubConnection.stop().catch(err => console.error('SignalR stop error:', err));
      });
    }
  }

  // Send message via REST (fallback or persistence)
sendMessageREST(msg: MessageDTO): Observable<any> {
  return this.http.post(`${URL.apiUrl}/Chat/send`, msg); // ⬅️ Should include token automatically via interceptor
}
  // Get all previous messages in a chat
  getMessages(chatId: number): Observable<MessageDTO[]> {
    return this.http.get<MessageDTO[]>(`${URL.apiUrl}/Chat/history/${chatId}`);
  }

  // Observable for receiving new SignalR messages
  onNewMessage(): Observable<MessageDTO> {
    return this.messageReceived.asObservable();
  }

getHandymanThreads(): Observable<ChatThread[]> {
  return this.http.get<ChatThread[]>(`${URL.apiUrl}/Chat/handyman/threads`);
}
getClientThreads(): Observable<ChatThread[]> {
  return this.http.get<ChatThread[]>(`${URL.apiUrl}/Chat/threads`);
}
}