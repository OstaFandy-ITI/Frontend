import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoggedInUser } from '../../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/Booking.service';
import { ChatComponent } from '../chat/chat.component';
import { ServiceService } from '../../Customer/services/service.service';
import { ServiceItem } from '../../../core/models/service.models';
import { CreateBookingVM } from '../../../core/models/Booking.model';

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
  bookingChatId = 1;
  selectedPayment = 'card';
  services = [{ category: '', type: '', description: '' }];
  userId!: number;
  currentUser!: LoggedInUser | null;

  constructor(
    private authService: AuthService,
    private BookingService: BookingService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.authService.CurrentUser$.subscribe((user) => {
      this.currentUser = user;
      this.userId = Number(user?.NameIdentifier);
      console.log('✅ userId:', this.userId);
      console.log('✅ currentUser:', this.currentUser);
      this.BookingService.setBooking({
        id: 5,
        chat: { id: 1 },
      });

      const booking = this.BookingService.getCurrentBooking();
      this.bookingChatId = booking?.chat?.id ?? 0;
      console.log('✅ bookingChatId:', this.bookingChatId);
    });

    //step1
    this.Getservices(4); //  ==> take catogery id later
    const saved = localStorage.getItem('selectedServices');
    if (saved) {
      this.SelectedItem = JSON.parse(saved);
    }
    //booking
    const savedBooking = localStorage.getItem('bookingData');
    if (savedBooking) {
      this.bookingData = JSON.parse(savedBooking);
    }
  }

  //#region Navigation
  goToStep(step: number): void {
    this.updateStepData(this.currentStep);
    if (step >= 1 && step <= 5) {
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  next(): void {
    this.updateStepData(this.currentStep);
    if (this.currentStep < 5) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  back(): void {
    this.updateStepData(this.currentStep);
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  getStepLabel(step: number): string {
    return ['Services', 'Location', 'Schedule', 'Checkout', 'Confirm'][
      step - 1
    ];
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

  // toggleChat() {
  //   this.chatVisible = !this.chatVisible;
  //   console.log('Chat toggled:', this.chatVisible, 'User ID:', this.userId, 'Chat ID:', this.bookingChatId);
  // }
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
    this.saveSelectedItems();
  }

  removeService(id: number) {
    this.SelectedItem = this.SelectedItem.filter((item) => item.id !== id);
    this.saveSelectedItems();
  }

  saveSelectedItems() {
    localStorage.setItem('selectedServices', JSON.stringify(this.SelectedItem));
  }

  //#endregion
  //#region Booking
  bookingData: CreateBookingVM = new CreateBookingVM();

  updateStepData(step: number): void {
    // Step 1: Services
    if (step === 1) {
      this.bookingData.clientId = this.userId;
      this.bookingData.serviceDto = this.SelectedItem.map((item) => ({
        serviceId: item.id,
        quantity: item.quantity,
      }));
      this.bookingData.totalPrice = this.SelectedItem.reduce(
        (sum, item) => sum + (item.fixedPrice || 0) * item.quantity,
        0
      );

      this.bookingData.estimatedMinutes = this.SelectedItem.reduce(
        (sum, item) => sum + (item.estimatedMinutes || 0) * item.quantity,
        0
      );
    }

    // Step 2: Location
    if (step === 2) {
    }

    // Step 3: Schedule
    if (step === 3) {
    }

    // Step 4: Payment
    if (step === 4) {
    }

    //Step 5: Save Data
    localStorage.setItem('bookingData', JSON.stringify(this.bookingData));
  }

  //#endregion
}
