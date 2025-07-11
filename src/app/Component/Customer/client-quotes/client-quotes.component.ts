import { QuoteService } from './../services/quote.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientQuote } from '../../../core/models/ClientProfile.model';
import { Notification, CreateBookingDTO, QuoteResponseDTO } from '../../../core/models/notification.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-quotes',
  imports: [CommonModule, FormsModule],
  templateUrl: './client-quotes.component.html',
  styleUrls: ['./clinet-quotes.component.css']
})
export class ClientQuotesComponent implements OnInit, OnDestroy {
  quotes: ClientQuote[] = [];
  currentPage = 1;
  pageSize = 2;
  // notifications: Notification[] = [];
  availableTimeSlots: any[] = [];
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();
  minDate: string;
  selectedTime: string = '';
  userId: number;
  selectedDate: string = '';
  processingQuote = false;
  selectedQuote: any = null;
  selectedQuoteId: number | null = null;
  showDatePicker = false;
  loadingTimeSlots = false;
  showTimeSlots = false;
  showRejectModal = false;
  rejectionReason: string = '';

  selectedStatus: string = 'All'; 

  constructor(
    private clientProfileService: ClientProfileService,
    private authService: AuthService,
    private quoteService: QuoteService,
    private toastr: ToastrService
   ) {
    this.minDate = new Date().toISOString().slice(0, 16);
    this.userId = this.authService.getCurrentUserId() ?? 0;
    this.selectedDate = new Date().toISOString().slice(0, 10);
  }

  ngOnInit() {
    this.loadQuotes();

    const userId = this.authService.getCurrentUserId() ?? 0;  
    this.quoteService.startConnection(userId);

    this.quoteService.onQuoteUpdate((message: string) => {
        this.toastr.info(message, 'Quote Updated');
        this.loadQuotes();
    });

    this.quoteService.onQuoteResponse((quoteId: number, action: string) => {
        this.toastr.info(`Quote ${quoteId} has been ${action}`, 'Quote Response');
        this.loadQuotes();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.quoteService.stopConnection();
  }

approveQuote(quote: ClientQuote) {
  this.selectedQuote = quote;
  this.selectedQuoteId = quote.quoteId;
  this.showDatePicker = true;
  this.resetModalState();
}

  rejectQuote(quote: ClientQuote) {
    console.log('Rejecting quote:', quote);
    this.selectedQuote = quote;
    this.selectedQuoteId = quote.quoteId;
    this.showRejectModal = true;
  }
formatTimeOnly(timeString: string): string {
  if (!timeString) return '';
  
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

  confirmQuoteRejection() {
    if (!this.selectedQuote) {
      console.error('No quote selected for rejection');
      return;
    }

    console.log('Confirming quote rejection for quote:', this.selectedQuote.quoteId);
    
    const dummyBookingData: CreateBookingDTO = {
      clientId: this.userId,
      addressId: this.selectedQuote.addressId || 1,
      preferredDate: new Date(),
      estimatedMinutes: 0,
      totalPrice: 0,
      note: this.rejectionReason || 'Quote rejection - no booking needed',
      serviceDto: [{ serviceId: 2, quantity: 1 }],
      handymanId: this.selectedQuote.handymanId || 1,
      amount: 0,
      method: 'Stripe',
      paymentStatus: 'Cancelled',
      receiptUrl: ''
    };

    const quoteResponse: QuoteResponseDTO = {
      quoteId: this.selectedQuote.quoteId,
      action: 'reject',
      clientUserId: this.userId,
      bookingData: dummyBookingData
    };

    this.processingQuote = true;
    
    this.quoteService.processQuoteResponse(quoteResponse).subscribe({
      next: (response) => {
        console.log('Quote rejected successfully:', response);
        this.toastr.success('Quote rejected successfully', 'Quote Rejected');
        this.closeAllModals();
        this.processingQuote = false;
        this.loadQuotes();
      },
      error: (error) => {
        console.error('Error rejecting quote:', error);
        this.processingQuote = false;
        this.toastr.error('Error rejecting quote. Please try again.', 'Error');
      }
    });
  }

onDateSelected() {
  
  if (!this.selectedQuote) {
    this.toastr.error('No quote selected. Please try again.', 'Error');
    return;
  }
  
  if (!this.selectedDate) {
    this.toastr.error('Please select a date.', 'Error');
    return;
  }
  
  const dateToCheck = new Date(this.selectedDate);
  if (isNaN(dateToCheck.getTime())) {
    this.toastr.error('Please select a valid date.', 'Invalid Date');
    return;
  }
  
  const handymanId = this.selectedQuote.handymanId;
  const estimatedMinutes = this.selectedQuote.estimatedMinutes || 60;

  if (!handymanId || handymanId === 0) {
    this.toastr.error('Invalid handyman information. Please try again.', 'Error');
    return;
  }
  
  if (!estimatedMinutes || estimatedMinutes <= 0) {
    this.toastr.error('Invalid service duration. Please try again.', 'Error');
    return;
  }
  
  this.loadingTimeSlots = true;
  
  this.quoteService.getAvailableTimeSlots(
    handymanId, 
    dateToCheck, 
    estimatedMinutes
  ).subscribe({
    next: (timeSlots) => {
      
      if (!timeSlots || timeSlots.length === 0) {
        this.toastr.warning('No available time slots found for this date. Please select another date.', 'No Time Slots');
        this.loadingTimeSlots = false;
        return;
      }
      
      this.availableTimeSlots = timeSlots;
      this.showDatePicker = false;
      this.showTimeSlots = true;
      this.loadingTimeSlots = false;
     },
    error: (error) => {
      this.loadingTimeSlots = false;
      this.toastr.error('Error loading available time slots. Please try again.', 'Error');
    }
  });
}

  // confirmQuoteApproval() {
  //   this.confirmQuoteAcceptance();
  // }

  confirmQuoteAcceptance() {
    if (!this.selectedQuote || !this.selectedDate || !this.selectedTime) {
        this.toastr.error('Please select both date and time slot.', 'Missing Information');
        return;
    }

    let finalDateTime: Date;
    
    if (this.selectedTime.includes('T')) {
        finalDateTime = new Date(this.selectedTime);
    } else {
        const [hours, minutes] = this.selectedTime.split(':').map(Number);
        finalDateTime = new Date(this.selectedDate);
        finalDateTime.setHours(hours, minutes, 0, 0);
    }

    if (isNaN(finalDateTime.getTime())) {
        console.error('Invalid date created:', finalDateTime);
        this.toastr.error('Invalid date/time selected. Please try again.', 'Invalid Date/Time');
        return;
    }

    const quoteId = this.selectedQuote.quoteId;
    const clientId = this.userId;
    const addressId = this.selectedQuote.addressId;
    const handymanId = this.selectedQuote.handymanId;
    const estimatedMinutes = this.selectedQuote.estimatedMinutes || 60;
    const totalPrice = this.selectedQuote.price || 0;

    if (!quoteId || !handymanId || !addressId || !clientId) {
        this.toastr.error('Error: Missing required data. Cannot process acceptance.', 'Missing Data');
        return;
    }

    let serviceDto: any[];
    
    if (this.selectedQuote.originalServices && this.selectedQuote.originalServices.length > 0) {
        serviceDto = this.selectedQuote.originalServices;
    } else {
        serviceDto = [{ 
            serviceId: 2,
            quantity: 1,
            price: totalPrice
        }];
    }

    const bookingData: CreateBookingDTO = {
        clientId: clientId,
        addressId: addressId,
        preferredDate: finalDateTime,
        estimatedMinutes: estimatedMinutes,
        totalPrice: totalPrice,
        note: this.selectedQuote.notes || `Booking created from quote acceptance on ${new Date().toISOString()}`,
        serviceDto: serviceDto,
        handymanId: handymanId,
        amount: totalPrice,
        method: 'Stripe',
        paymentStatus: 'Pending',
        receiptUrl: ''
    };

    const quoteResponse: QuoteResponseDTO = {
        quoteId: quoteId,
        action: 'accept',
        clientUserId: this.userId,
        bookingData: bookingData
    };

    this.processingQuote = true;
    this.quoteService.processQuoteResponse(quoteResponse).subscribe({
        next: (response) => {
            // const notification = this.notifications.find(n => 
            //     n.relatedEntityId === quoteId && 
            //     n.type === 'QuoteApproval'
            // );
            // if (notification) {
            //     notification.isRead = true;
            //     notification.actionTaken = 'accept';
            // }
            
            this.closeAllModals();
            this.processingQuote = false;
            this.toastr.success('Quote accepted and booking created successfully!', 'Quote Accepted');
            this.loadQuotes();
        },
        error: (error) => {
            if (error.error && error.error.errors) {
                const errorMessages = [];
                for (const field in error.error.errors) {
                    const fieldErrors = error.error.errors[field];
                    errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
                }
                this.toastr.error(`Validation Errors:\n${errorMessages.join('\n')}`, 'Validation Error');
            } else {
                const errorMessage = error.error?.message || error.error?.title || error.message || 'Unknown error';
                this.toastr.error(`Error accepting quote: ${errorMessage}`, 'Error');
            }
            this.processingQuote = false;
        }
    });
  }
  closeAllModals() {
    this.showDatePicker = false;
    this.showTimeSlots = false;
    this.showRejectModal = false;
    this.resetModalState();
  }

  private resetModalState() {
    this.selectedDate = new Date().toISOString().slice(0, 10);
    this.selectedTime = '';
    this.availableTimeSlots = [];
  }

  goBackToDatePicker() {
    this.showTimeSlots = false;
    this.showDatePicker = true;
    this.selectedTime = '';
    this.availableTimeSlots = [];
  }

  private loadQuotes() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.clientProfileService.getClientQuotes(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isSuccess && response.data) {
            this.quotes = response.data;

            console.log('Loaded quotes:', this.quotes.map(q => ({ id: q.bookingId, status: q.status })));

          } else {
            this.errorMessage = response.message || 'Failed to load quotes';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'An error occurred while loading quotes';
          console.error('Error loading quotes:', error);
        }
      });
  }

  get filteredQuotes(): ClientQuote[] { 
    if (this.selectedStatus === 'All') {
      return this.quotes;
    } else {
      return this.quotes.filter(quote => quote.status === this.selectedStatus);
    }
  }

  get uniqueStatuses(): string[] {
    const statuses = new Set<string>();
    this.quotes.forEach(quote => {
      if (quote.status !== 'Approved') {
        statuses.add(quote.status);
      }
    });
    const sortedStatuses = Array.from(statuses).sort();
    return ['All', ...sortedStatuses]; 
  }

  pagedQuotes(): ClientQuote[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredQuotes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredQuotes.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByQuoteId(index: number, quote: ClientQuote): number {
    return quote.quoteId;
  }
}