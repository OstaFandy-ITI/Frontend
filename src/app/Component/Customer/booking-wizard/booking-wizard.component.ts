import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoggedInUser } from '../../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/Booking.service';
import { ChatComponent } from '../chat/chat.component';
@Component({
  selector: 'app-booking-wizard',
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css'],
    standalone: true,

  imports: [FormsModule,CommonModule,ChatComponent]
})
export class BookingWizardComponent implements OnInit {
  currentStep = 1;
  chatVisible = false;
  bookingChatId = 1;
  selectedPayment = 'card';
  services = [{ category: '', type: '', description: '' }];

  currentUser!: LoggedInUser | null;
 get userId(): number {
    return +(this.currentUser?.nameidentifier ?? 0);
  }
constructor(private authService: AuthService, private BookingService:BookingService) {}

ngOnInit(): void {
  this.authService.CurrentUser$.subscribe(user => {
    console.log('CurrentUser:', user); 

    this.currentUser = user;

    if (user?.nameidentifier) {
      const userId = +user.nameidentifier;
      console.log(' User ID:', userId);

      const booking = this.BookingService.getCurrentBooking();
      console.log(' Booking:', booking);

      if (booking?.chat?.id) {
        this.bookingChatId = booking.chat.id;
        console.log(' Chat ID:', this.bookingChatId);
      } else {
        console.log('No chat ID found in booking');
      }
    } else {
      console.log(' User not logged in or no ID in token');
    }
  });
}



  addService() {
    this.services.push({ category: '', type: '', description: '' });
  }

  removeService(index: number) {
    this.services.splice(index, 1);
  }

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
      'bi bi-check-circle'
    ][step - 1];
  }

  selectPayment(method: 'card' | 'cash') {
    this.selectedPayment = method;
  }


  
}
