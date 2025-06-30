import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoggedInUser } from '../../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/Booking.service';
import { ChatComponent } from '../chat/chat.component';
import { ServiceService } from '../../Customer/services/service.service';
import { ServiceItem } from '../../../core/models/service.models';
import { ChatService } from '../../Customer/services/chat.service'; // ✅
import { ChatThread } from '../../../core/models/message.model';

@Component({
  selector: 'app-booking-wizard',
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ChatComponent],
})
export class BookingWizardComponent implements OnInit {
  currentStep = 1;
  chatVisible = false;
  selectedPayment = 'card';
  services = [{ category: '', type: '', description: '' }];
  userId!: number;
  currentUser!: LoggedInUser | null;
  bookingChatId: number | undefined;

  constructor(
    private authService: AuthService,
    private BookingService: BookingService,
    private serviceService: ServiceService,
    private chatService: ChatService // ✅
  ) {}

  ngOnInit(): void {
    this.authService.CurrentUser$.subscribe((user) => {
      if (!user) return;
      this.currentUser = user;
      this.userId = Number(user?.NameIdentifier);

      // ✅ Dynamically fetch client's chat thread
this.chatService.getClientThreads().subscribe({
  next: (threads: ChatThread[]) => {
    const chat = threads[0]; // use the first available chat always
    if (chat?.chatId) {
      this.bookingChatId = chat.chatId;
      this.chatVisible = true;
      console.log('✅ Found chat:', this.bookingChatId);
    } else {
      console.warn('❌ No chat found. Consider ensuring one exists for this user.');
    }
  },
  error: (err) => console.error('❌ Failed to fetch chat threads', err),
});


    });

    this.Getservices(4);
  }

  //#region Navigation
  goToStep(step: number): void {
    if (step >= 1 && step <= 5) {
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  next(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  back(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  getStepLabel(step: number): string {
    return ['Services', 'Location', 'Schedule', 'Checkout', 'Confirm'][step - 1];
  }

  getStepIcon(step: number): string {
    return [
      'bi bi-tools',
      'bi bi-geo-alt',
      'bi bi-calendar2-week',
      'bi bi-wallet2',
      'bi bi-check-circle',
    ][step - 1];
  }

  selectPayment(method: 'card' | 'cash') {
    this.selectedPayment = method;
  }

  //#endregion

  //#region step 1
  ServicesItem: ServiceItem[] = [];
  SelectedItem: Array<ServiceItem & { quantity: number }> = [];

  Getservices(categoryId: number) {
    this.serviceService.GetServiceByCategoryId(categoryId).subscribe({
      next: (response) => {
        this.ServicesItem = response;
        console.log(this.ServicesItem);
      },
    });
  }

  addService(item: ServiceItem) {
    const found = this.SelectedItem.find((s) => s.id === item.id);
    if (found) {
      found.quantity++;
    } else {
      this.SelectedItem.push({
        ...item,
        quantity: 1,
      });
    }
  }

  removeService(id: number) {
    this.SelectedItem = this.SelectedItem.filter((item) => item.id !== id);
  }

  //#endregion
}
