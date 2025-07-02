import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../Customer/services/chat.service';
import { ChatThread } from '../../../core/models/message.model';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../Customer/chat/chat.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
  imports: [CommonModule, ChatComponent]
})
export class ChatListComponent implements OnInit {
  threads: ChatThread[] = [];
  selectedChatId: number | null = null;
  userId: number = 0;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.CurrentUser$.subscribe(user => {
      if (!user) return;

      this.userId = +user.NameIdentifier!;
      console.log('✅ Handyman userId:', this.userId);

      this.chatService.getHandymanThreads().subscribe({
        next: data => this.threads = data,
        error: err => console.error('❌ Failed to load chat threads', err)
      });
    });
  }

  openChat(thread: ChatThread): void {
    this.selectedChatId = thread.chatId;
  }
}
