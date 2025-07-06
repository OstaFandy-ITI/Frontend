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
  styleUrls: ['./client-quotes.component.css']
})
export class ClientQuotesComponent implements OnInit, OnDestroy {
  quotes: ClientQuote[] = [];
  notifications: Notification[] = [];
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
  unreadCount = 0;

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
        console.log('Quote notification received:', message);
        this.toastr.info(message, 'Quote Updated');
        this.loadQuotes();
    });

    this.quoteService.onQuoteResponse((quoteId: number, action: string) => {
        console.log('Quote response received:', quoteId, action);
        this.toastr.info(`Quote ${quoteId} has been ${action}`, 'Quote Response');
        this.loadQuotes();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Main quote approval function called from template
approveQuote(quote: ClientQuote) {
  console.log('=== APPROVE QUOTE DEBUG ===');
  console.log('Quote received:', quote);
  console.log('Quote ID:', quote?.quoteId);
  
  this.selectedQuote = quote;
  this.selectedQuoteId = quote.quoteId;
  this.showDatePicker = true;
  this.resetModalState();
  
  console.log('After setting values:');
  console.log('selectedQuote:', this.selectedQuote);
  console.log('showDatePicker:', this.showDatePicker);
  console.log('selectedQuoteId:', this.selectedQuoteId);
  
  // Force change detection
  setTimeout(() => {
    console.log('After timeout - showDatePicker:', this.showDatePicker);
  }, 100);
}

  // Main quote rejection function called from template
  rejectQuote(quote: ClientQuote) {
    console.log('Rejecting quote:', quote);
    this.selectedQuote = quote;
    this.selectedQuoteId = quote.quoteId;
    this.showRejectModal = true;
    // this.rejectionReason = '';
  }

  // Confirm quote rejection
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
        this.loadQuotes(); // Refresh quotes list
      },
      error: (error) => {
        console.error('Error rejecting quote:', error);
        this.processingQuote = false;
        this.toastr.error('Error rejecting quote. Please try again.', 'Error');
      }
    });
  }

  // Handle quote approval (existing function)
  private handleQuoteApproval(notification: Notification) {
    console.log('Handling quote approval for notification:', notification);
    console.log('Related Entity ID:', notification.relatedEntityId);
    
    if (!notification.relatedEntityId) {
        console.error('No quote ID found in notification');
        return;
    }

    this.processingQuote = true;
    this.quoteService.getQuoteByJobId(notification.relatedEntityId).subscribe({
        next: (quoteDetails) => {
            console.log('Quote details loaded:', quoteDetails);
            this.selectedQuote = quoteDetails;
            this.showDatePicker = true;
            this.processingQuote = false;
        },
        error: (error) => {
            console.error('Error loading quote details:', error);
            this.processingQuote = false;
            this.toastr.error('Error loading quote details. Please try again.', 'Error');
        }
    });
  }
debugQuoteObject(quote: ClientQuote) {
  console.log('=== QUOTE OBJECT DEBUG ===');
  console.log('Full quote object:', JSON.stringify(quote, null, 2));
  console.log('Quote properties:');
  console.log('- quoteId:', quote.quoteId);
  console.log('- handymanId:', quote.handymanId);
//   console.log('- handymanName:', quote.handymanName);
//   console.log('- clientId:', quote.clientId);
//   console.log('- addressId:', quote.addressId);
//   console.log('- estimatedMinutes:', quote.estimatedMinutes);
//   console.log('- price:', quote.price);
  console.log('- All available properties:', Object.keys(quote));
}
onDateSelected() {
  console.log('=== DATE SELECTED DEBUG ===');
  console.log('selectedQuote:', this.selectedQuote);
  console.log('selectedDate:', this.selectedDate);
  
  if (!this.selectedQuote) {
    console.error('No quote selected');
    this.toastr.error('No quote selected. Please try again.', 'Error');
    return;
  }
  
  if (!this.selectedDate) {
    console.error('No date selected');
    this.toastr.error('Please select a date.', 'Error');
    return;
  }
  
  const dateToCheck = new Date(this.selectedDate);
  if (isNaN(dateToCheck.getTime())) {
    console.error('Invalid date:', this.selectedDate);
    this.toastr.error('Please select a valid date.', 'Invalid Date');
    return;
  }
  
  // Validate required fields with detailed logging
  const handymanId = this.selectedQuote.handymanId;
  const estimatedMinutes = this.selectedQuote.estimatedMinutes || 60; // Default to 60 if undefined
  
  console.log('Validation check:');
  console.log('handymanId:', handymanId, 'Type:', typeof handymanId);
  console.log('dateToCheck:', dateToCheck, 'Type:', typeof dateToCheck);
  console.log('estimatedMinutes:', estimatedMinutes, 'Type:', typeof estimatedMinutes);
  
  if (!handymanId || handymanId === 0) {
    console.error('Invalid handyman ID:', handymanId);
    this.toastr.error('Invalid handyman information. Please try again.', 'Error');
    return;
  }
  
  if (!estimatedMinutes || estimatedMinutes <= 0) {
    console.error('Invalid estimated minutes:', estimatedMinutes);
    this.toastr.error('Invalid service duration. Please try again.', 'Error');
    return;
  }
  
  console.log('Calling getAvailableTimeSlots with:');
  console.log('- handymanId:', handymanId);
  console.log('- dateToCheck:', dateToCheck.toISOString());
  console.log('- estimatedMinutes:', estimatedMinutes);
  
  this.loadingTimeSlots = true;
  
  this.quoteService.getAvailableTimeSlots(
    handymanId, 
    dateToCheck, 
    estimatedMinutes
  ).subscribe({
    next: (timeSlots) => {
      console.log('Available time slots received:', timeSlots);
      
      if (!timeSlots || timeSlots.length === 0) {
        this.toastr.warning('No available time slots found for this date. Please select another date.', 'No Time Slots');
        this.loadingTimeSlots = false;
        return;
      }
      
      this.availableTimeSlots = timeSlots;
      this.showDatePicker = false;
      this.showTimeSlots = true;
      this.loadingTimeSlots = false;
      
      console.log('Successfully loaded time slots:', this.availableTimeSlots);
    },
    error: (error) => {
      console.error('=== TIME SLOTS ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      this.loadingTimeSlots = false;
      this.toastr.error('Error loading available time slots. Please try again.', 'Error');
    }
  });
}

  // Updated to match template call
  confirmQuoteApproval() {
    this.confirmQuoteAcceptance();
  }

  confirmQuoteAcceptance() {
    if (!this.selectedQuote || !this.selectedDate || !this.selectedTime) {
        this.toastr.error('Please select both date and time slot.', 'Missing Information');
        return;
    }

    console.log('=== DEBUGGING QUOTE ACCEPTANCE ===');
    console.log('Selected Quote Data:', JSON.stringify(this.selectedQuote, null, 2));
    console.log('Selected Date:', this.selectedDate);
    console.log('Selected Time:', this.selectedTime);
    console.log('User ID:', this.userId);

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

    console.log('Final DateTime:', finalDateTime.toISOString());

    // const currentUser = this.authService.getCurrentUser();
    // const clientId = currentUser?.id || currentUser?.userId;
    // const addressId = currentUser?.addressId || this.getSelectedAddressId();
    //  let addressId = this.selectedQuote.addressId;
    // Extract values with proper fallbacks
    const quoteId = this.selectedQuote.quoteId;
    const clientId = this.userId;
    const addressId = this.selectedQuote.addressId;
    const handymanId = this.selectedQuote.handymanId;
    const estimatedMinutes = this.selectedQuote.estimatedMinutes || 60;
    const totalPrice = this.selectedQuote.price || 0;

    console.log('=== EXTRACTED VALUES ===');
    console.log('Quote ID:', quoteId);
    console.log('Client ID:', clientId);
    console.log('Address ID:', addressId);
    console.log('Handyman ID:', handymanId);
    console.log('Estimated Minutes:', estimatedMinutes);
    console.log('Total Price:', totalPrice);

    // Validate required fields
    if (!quoteId || !handymanId || !addressId || !clientId) {
        console.error('Missing required fields');
        console.error('Quote ID:', quoteId);
        console.error('Handyman ID:', handymanId);
        console.error('Address ID:', addressId);
        console.error('Client ID:', clientId);
        this.toastr.error('Error: Missing required data. Cannot process acceptance.', 'Missing Data');
        return;
    }

    // Handle empty services array
    let serviceDto: any[];
    
    if (this.selectedQuote.originalServices && this.selectedQuote.originalServices.length > 0) {
        serviceDto = this.selectedQuote.originalServices;
    } else {
        serviceDto = [{ 
            serviceId: 2,
            quantity: 1,
            price: totalPrice
        }];
        
        console.log('Created default service DTO since originalServices is empty:', serviceDto);
    }

    // Create booking data
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

    console.log('=== FINAL PAYLOAD ===');
    console.log('Quote Response:', JSON.stringify(quoteResponse, null, 2));

    this.processingQuote = true;
    this.quoteService.processQuoteResponse(quoteResponse).subscribe({
        next: (response) => {
            console.log('Quote acceptance response:', response);
            // Update the notification
            const notification = this.notifications.find(n => 
                n.relatedEntityId === quoteId && 
                n.type === 'QuoteApproval'
            );
            if (notification) {
                notification.isRead = true;
                notification.actionTaken = 'accept';
            }
            
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            this.closeAllModals();
            this.processingQuote = false;
            this.toastr.success('Quote accepted and booking created successfully!', 'Quote Accepted');
            this.loadQuotes(); // Refresh quotes list
        },
        error: (error) => {
            console.error('=== ERROR DETAILS ===');
            console.error('Status:', error.status);
            console.error('Status Text:', error.statusText);
            console.error('Error Object:', error.error);
            
            if (error.error && error.error.errors) {
                console.error('Validation Errors:', error.error.errors);
                
                // Display specific validation errors
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

  onTimeSelected(timeSlot: any) {
    console.log('Time slot selected:', timeSlot);
    
    // Handle different time slot formats
    if (typeof timeSlot === 'string') {
        this.selectedTime = timeSlot;
    } else if (timeSlot.time) {
        this.selectedTime = timeSlot.time;
    } else if (timeSlot.startTime) {
        this.selectedTime = timeSlot.startTime;
    } else if (timeSlot.value) {
        this.selectedTime = timeSlot.value;
    } else {
        this.selectedTime = timeSlot.toString();
    }
    
    console.log('Selected time set to:', this.selectedTime);
    
    // Extract just the time part if it's a full datetime string
    if (this.selectedTime.includes('T')) {
        const timePart = this.selectedTime.split('T')[1];
        if (timePart) {
            this.selectedTime = timePart.substring(0, 5);
        }
    }
    
    console.log('Final selected time:', this.selectedTime);
  }

  private handleQuoteRejection(notification: Notification) {
    console.log('Starting quote rejection process');
    
    if (!notification.relatedEntityId) {
        console.error('No quote ID found in notification');
        return;
    }

    const dummyBookingData: CreateBookingDTO = {
        clientId: this.userId,
        addressId: 1,
        preferredDate: new Date(),
        estimatedMinutes: 0,
        totalPrice: 0,
        note: 'Quote rejection - no booking needed',
        serviceDto: [{ serviceId: 2, quantity: 1 }],
        handymanId: 1,
        amount: 0,
        method: 'Stripe',
        paymentStatus: 'Cancelled',
        receiptUrl: ''
    };

    const quoteResponse: QuoteResponseDTO = {
        quoteId: notification.relatedEntityId,
        action: 'reject',
        clientUserId: this.userId,
        bookingData: dummyBookingData
    };

    this.processingQuote = true;
    
    this.quoteService.processQuoteResponse(quoteResponse).subscribe({
        next: (response) => {
            notification.isRead = true;
            notification.actionTaken = 'reject';
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            this.processingQuote = false;
            console.log('Quote rejected successfully');
        },
        error: (error) => {
            console.error('Error rejecting quote:', error);
            this.processingQuote = false;
            this.toastr.error('Error rejecting quote. Please try again.', 'Error');
        }
    });
  }

  // Modal management
  closeAllModals() {
    this.showDatePicker = false;
    this.showTimeSlots = false;
    this.showRejectModal = false;
    this.resetModalState();
  }

  private resetModalState() {
    // this.selectedQuote = null;
    // this.selectedQuoteId = null;
    this.selectedDate = new Date().toISOString().slice(0, 10);
    this.selectedTime = '';
    // this.rejectionReason = '';
    this.availableTimeSlots = [];
    this.selectedDate = new Date().toISOString().slice(0, 10);
  this.selectedTime = '';
  // this.rejectionReason = '';
  this.availableTimeSlots = [];
  }

  goBackToDatePicker() {
    this.showTimeSlots = false;
    this.showDatePicker = true;
    this.selectedTime = '';
    this.availableTimeSlots = [];
  }

  private handleQuoteStatusApproval(notification: Notification) {
    const jobId = parseInt(notification.type.split(',')[0]) || 0;
    const requestedStatus = notification.type.split(',')[1];
    
    this.quoteService.approveQuoteStatus(jobId, requestedStatus, this.userId).subscribe({
        next: (response) => {
            notification.isRead = true;
            notification.actionTaken = 'approved';
            notification.currentJobStatus = requestedStatus;
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            console.log('Quote status approved successfully');
        },
        error: (error) => {
            console.error('Error approving quote status:', error);
        }
    });
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
            // Debug: Log quote statuses to console
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