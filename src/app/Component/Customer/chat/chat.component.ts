import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from '../services/chat.service';
import { MessageDTO } from '../../../core/models/message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chatId!: number;
  @Input() userId!: number;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  messages: MessageDTO[] = [];
  newMessage: string = '';

  private messageSub!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    if (!this.chatId) return;

    this.chatService.getMessages(this.chatId).subscribe(history => {
      this.messages = history;
      setTimeout(() => this.scrollToBottom(), 100);
    });

    this.chatService.startConnection(this.chatId);

    this.messageSub = this.chatService.onNewMessage().subscribe((msg) => {
      this.messages.push(msg);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const msg = {
      chatId: this.chatId,
      content: this.newMessage.trim()
    };

    this.chatService.sendMessageREST(msg).subscribe({
      next: () => {
        this.messages.push({
          chatId: this.chatId,
          content: msg.content,
          senderId: this.userId, // for local UI only
          sentAt: new Date().toISOString()
        });
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('❌ Failed to send message', err);
      }
    });
  }

  scrollToBottom() {
    const el = this.scrollContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  close() {
    this.chatService.stopConnection(this.chatId);
  }

  ngOnDestroy(): void {
    this.close();
    this.messageSub?.unsubscribe();
  }
}
