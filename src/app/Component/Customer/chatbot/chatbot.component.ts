import { ChatbotService } from './../services/chatbot.service';
import { AuthService } from './../../../core/services/auth.service';
import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { UserChatRequestDto } from '../../../core/models/Chatbot.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  userId!: number | null;
  message = '';
  chat: { from: string, text: string, time: Date }[] = [];
  isTyping = false;
  @Output() closed = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private chatbotService: ChatbotService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId() ?? 0;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  close() {
    this.closed.emit();
  }

  sendMessage() {
    if (!this.message.trim()) return;

    const now = new Date();
    const userreq: UserChatRequestDto = {
      userid: this.userId!.toString(),
      message: this.message
    };

    this.chat.push({ from: "user", text: this.message, time: now });
    this.message = ''; 
    this.isTyping = true;

    this.chatbotService.sendMessage(userreq).subscribe({
      next: (value) => {
        const botNow = new Date();
        this.chat.push({ from: "bot", text: value.suggestedService, time: botNow });
        this.isTyping = false;
      },
      error: (err) => {
        const errorNow = new Date();
        this.chat.push({ from: 'bot', text: 'Something went wrong 🤖', time: errorNow });
        console.error(err.error.message);
        this.isTyping = false;
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error', err);
    }
  }
}
