// import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { ChatService } from '../services/chat.service';
// import { MessageDTO } from '../../../core/models/message.model';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css'],
//   imports: [CommonModule, FormsModule, HttpClientModule],
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   @Input() chatId!: number;
//   @Input() userId!: number;

//   @ViewChild('scrollContainer') scrollContainer!: ElementRef;

//   messages: MessageDTO[] = [];
//   newMessage: string = '';

//   private messageSub!: Subscription;

//   constructor(private chatService: ChatService) {}

//   ngOnInit(): void {
//     if (!this.chatId) return;

//     this.chatService.getMessages(this.chatId).subscribe(history => {
//       this.messages = history;
//       setTimeout(() => this.scrollToBottom(), 100);
//     });

//     this.chatService.startConnection(this.chatId);

//     this.messageSub = this.chatService.onNewMessage().subscribe((msg) => {
//       this.messages.push(msg);
//       setTimeout(() => this.scrollToBottom(), 100);
//     });
//   }

// sendMessage(): void {
//   if (!this.newMessage.trim()) return;

//   const msg: MessageDTO = {
//     chatId: this.chatId,
//     senderId: this.userId, // ✅ this must be set
//     content: this.newMessage.trim()
//   };

//   this.chatService.sendMessageREST(msg).subscribe({
//     next: () => {
//       this.messages.push({
//         chatId: this.chatId,
//         content: msg.content,
//         senderId: this.userId,
//         sentAt: new Date().toISOString()
//       });
//       this.newMessage = '';
//       setTimeout(() => this.scrollToBottom(), 100);
//     },
//   error: (err) => {
//   console.error('❌ Failed to send message', err);

//   // Prevent token loss: log the error, do not logout
//   if (err.status === 401 || err.status === 403) {
//     console.warn('Chat unauthorized, but not logging out');
//   }
// }
//   });
// }

//   scrollToBottom() {
//     const el = this.scrollContainer?.nativeElement;
//     if (el) el.scrollTop = el.scrollHeight;
//   }

//   close() {
//     this.chatService.stopConnection(this.chatId);
//   }

//   ngOnDestroy(): void {
//     this.close();
//     this.messageSub?.unsubscribe();
//   }
// }
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  chatId!: number;
  userId!: number;

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
    this.chatId = +this.route.snapshot.paramMap.get('chatId')!;

    this.authService.CurrentUser$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        console.error('❌ No logged-in user found');
        return;
      }

this.userId = +user.NameIdentifier!;

      // Get message history
      this.chatService.getMessages(this.chatId).subscribe(history => {
        this.messages = history;
        setTimeout(() => this.scrollToBottom(), 100);
      });

      // Start SignalR connection
      this.chatService.startConnection(this.chatId);

      // Listen for real-time messages
      this.messageSub = this.chatService.onNewMessage().subscribe((msg) => {
        this.messages.push(msg);
        setTimeout(() => this.scrollToBottom(), 100);
      });
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const msg: MessageDTO = {
      chatId: this.chatId,
      senderId: this.userId,
      content: this.newMessage.trim()
    };

    this.chatService.sendMessageREST(msg).subscribe({
      next: () => {
        this.messages.push({
          chatId: this.chatId,
          content: msg.content,
          senderId: this.userId,
          sentAt: new Date().toISOString()
        });
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('❌ Failed to send message', err);
        if (err.status === 401 || err.status === 403) {
          console.warn('Chat unauthorized');
        }
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
