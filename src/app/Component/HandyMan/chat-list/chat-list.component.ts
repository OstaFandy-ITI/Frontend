import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../Customer/services/chat.service';
import { ChatThread } from '../../../core/models/message.model'; // ✅ use shared interface
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../Customer/chat/chat.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'], 
  imports: [CommonModule,] 
})
export class ChatListComponent implements OnInit {
  threads: ChatThread[] = []; // ✅ use shared interface

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.chatService.getHandymanThreads().subscribe({
      next: data => this.threads = data,
      error: err => console.error('❌ Failed to load chat threads', err)
    });
  }

openChat(thread: ChatThread) {
  this.router.navigate(['/handyman/chat', thread.chatId]);
}
}
