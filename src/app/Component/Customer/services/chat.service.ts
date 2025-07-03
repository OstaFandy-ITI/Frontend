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
 startConnection(chatId: number): Promise<void> {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7187/chatHub", {
      
    })
    .withAutomaticReconnect()
    .build();

  this.hubConnection.onclose(error => {
    console.warn("❌ SignalR disconnected", error);
  });

  this.hubConnection.onreconnected(() => {
    console.log("🔄 SignalR reconnected");
  });

  this.hubConnection.on('ReceiveMessage', (msg: MessageDTO) => {
    console.log('📥 SignalR message received:', msg);
    this.messageReceived.next(msg);
  });

  return this.hubConnection
    .start()
    .then(() => {
      console.log('✅ SignalR connected');
      return this.hubConnection.invoke('JoinChat', chatId);
    })
    .catch(err => {
      console.error('❌ SignalR connection error:', err);
      throw err;
    });
}

  // Stop SignalR connection and leave chat group
  stopConnection(chatId: number): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      this.hubConnection.invoke('LeaveChat', chatId).finally(() => {
        this.hubConnection
          .stop()
          .catch((err: any) => console.error('SignalR stop error:', err));
      });
    }
  }

  // Send message via REST (fallback or persistence)
  sendMessageREST(msg: MessageDTO): Observable<any> {
    return this.http.post(`${URL.apiUrl}/Chat/send`, msg);
  }

  sendSignalRMessage(msg: MessageDTO): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendMessage', msg).catch((err) => {
        console.error('❌ SignalR send failed', err);
      });
    } else {
      console.warn('⚠️ SignalR not connected');
    }
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
