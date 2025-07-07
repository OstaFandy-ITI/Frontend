import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../Customer/services/chat.service';
import { ChatThread } from '../../../core/models/message.model';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../Customer/chat/chat.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
  imports: [CommonModule, ChatComponent, FormsModule],
})
export class ChatListComponent implements OnInit {
  threads: ChatThread[] = [];
  selectedChatId: number | null = null;
  userId: number = 0;
  isHandyman = false;

  // Filters & Pagination
  nameFilter: string = '';
  sort: string = 'newest';
  pageNumber: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  loading: boolean = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.CurrentUser$.subscribe((user) => {
      if (!user) return;

      this.userId = +user.NameIdentifier!;
      this.isHandyman = user.UserType === 'Handyman';

      this.chatService.startGlobalConnection().then(() => {
        this.chatService.onNewChatThread().subscribe(() => {
          this.loadThreads();
        });
      });

      this.loadThreads();
    });
  }

  loadThreads(): void {
    this.loading = true;
    const filters = {
      name: this.nameFilter,
      sort: this.sort,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    const fetch$ = this.isHandyman
      ? this.chatService.getHandymanThreads(filters)
      : this.chatService.getClientThreads(filters);

   fetch$.subscribe({
  next: (res) => {
    console.log('📦 Handyman chat threads response:', res); // 👈 Add this
    this.threads = res.items;
    this.totalItems = res.totalItems;
    this.loading = false;
  },
  error: (err) => {
    console.error('❌ Failed to load chat threads', err); // already there
    this.loading = false;
  }
});
  }

  onSearchChange(): void {
    this.pageNumber = 1;
    this.loadThreads();
  }

  onSortChange(value: string): void {
    this.sort = value;
    this.loadThreads();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadThreads();
  }

  openChat(thread: ChatThread): void {
    this.selectedChatId = thread.chatId;
  }


  
}
