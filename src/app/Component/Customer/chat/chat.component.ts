import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { MessageDTO } from '../../../core/models/message.model';
import { Subscription, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
 ngOnInit(): void {
  if (!this.chatId || !this.userId) {
    console.error('❌ chatId or userId missing; cannot start chat connection');
    return;
  }

  console.log('💬 Starting connection to chat', this.chatId);

  // 1. Load message history from REST
  this.chatService.getMessages(this.chatId).subscribe((history) => {
    this.messages = history;
    setTimeout(() => this.scrollToBottom(), 100);
  });

  // 2. Start SignalR connection and only then listen for messages
  this.chatService.startConnection(this.chatId).then(() => {
    console.log('✅ SignalR connection + group join complete');

    // 3. Only now start listening for messages
    this.messageSub = this.chatService.onNewMessage().subscribe((msg) => {
      console.log('📬 Received in component:', msg);
      this.messages.push(msg);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  });
}

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const msg: MessageDTO = {
      chatId: this.chatId,
      senderId: this.userId || 0,
      content: this.newMessage.trim(),
    };

    this.chatService.sendMessageREST(msg).subscribe({
      next: () => {
        this.messages.push({
          chatId: this.chatId,
          content: msg.content,
          senderId: this.userId,
          sentAt: new Date().toISOString(),
        });

        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);

        // ✅ Broadcast to others via SignalR
        setTimeout(() => {
          this.chatService.sendSignalRMessage(msg);
        }, 100);
      },
      error: (err) => {
        console.error('❌ Failed to send message', err);
      },
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
