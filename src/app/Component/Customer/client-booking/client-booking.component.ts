import { Component, OnInit } from '@angular/core';
import { ClientProfileService } from '../services/client-profile.service';
import { BookingService } from '../../Admin/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateReviewRequest } from '../../../core/models/ClientProfile.model';

@Component({
  selector: 'app-client-booking',

  imports: [CommonModule, FormsModule],
  templateUrl: './client-booking.component.html',
  styleUrls: ['./client-booking.component.css']
})
export class ClientBookingComponent implements OnInit {
  orders: any[] = [];
  currentPage = 1;
  pageSize = 2;
  cancellingId: number | null = null;

  showCancelModal: boolean = false;
  bookingToCancelId: number | null = null;
  selectedStatus: string = 'All'; // Changed from selectedService to selectedStatus

  
  // Review Modal Properties
  showReviewModal: boolean = false;
  reviewBookingId: number | null = null;
  reviewRating: number = 0;
  reviewComment: string = '';
  isSubmittingReview: boolean = false;

  // Success and Alert Dialog Properties
  showSuccessDialog: boolean = false;
  successMessage: string = '';
  showAlertDialog: boolean = false;
  alertMessage: string = '';

  constructor(
    private clientProfileService: ClientProfileService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.loadOrders(userId);
    }
  }

  loadOrders(userId: number) {
    this.clientProfileService.getClientOrderHistory(userId).subscribe({
      next: (res) => {
        this.orders = res.data.orders || [];
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  // Modified getter to filter orders based on selectedStatus
  get filteredOrders() {
    if (this.selectedStatus === 'All') {
      return this.orders;
    } else {
      return this.orders.filter(order => order.status === this.selectedStatus);
    }
  }

  pagedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  cancelBooking(bookingId: number) {
    this.bookingToCancelId = bookingId;
    this.showCancelModal = true;
  }

  confirmCancel() {
  if (this.bookingToCancelId !== null) {

    
    this.cancellingId = this.bookingToCancelId;

    this.bookingService.CancelBooking(this.bookingToCancelId).subscribe({
      next: (response) => {
        
        let actualResponse = response;
        
        if (response && typeof response === 'object' && 'body' in response) {
          actualResponse = (response as any).body;
        }

        if (actualResponse && (actualResponse.isSuccess || actualResponse.statusCode === 200)) {
          this.orders = this.orders.map(order =>
            order.bookingId === this.bookingToCancelId ? { ...order, status: 'Cancelled' } : order
          );

          this.cancellingId = null;
          this.closeCancelModal();
          this.showSuccessMessage(actualResponse.message || 'Booking cancelled successfully!');
        } else {
          this.cancellingId = null;
          this.showAlertMessage(actualResponse?.message || 'Failed to cancel booking');
        }
      },
      error: (error) => {

        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error body:', error.error);
        console.error('Error url:', error.url);
        
        this.cancellingId = null;
        
        let errorMessage = 'Failed to cancel booking';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid request. Please check the booking details.';
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized to cancel this booking.';
        } else if (error.status === 404) {
          errorMessage = 'Booking not found.';
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        this.showAlertMessage(errorMessage);
      }
    });
  }
}

  closeCancelModal() {
    this.showCancelModal = false;
    this.bookingToCancelId = null;
  }

  // Method to get unique statuses for the filter dropdown
  get uniqueStatuses(): string[] {
    const statuses = new Set<string>();
    this.orders.forEach(order => {
      statuses.add(order.status);
    });
    return ['All', ...Array.from(statuses)];
  }

  // Review Modal Methods
  openReviewModal(bookingId: number) {
    this.reviewBookingId = bookingId;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.reviewBookingId = null;
    this.reviewRating = 0;
    this.reviewComment = '';
  }

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  submitReview() {
    if (this.reviewBookingId && this.reviewRating > 0) {
      this.isSubmittingReview = true;

      const reviewData: CreateReviewRequest = {
        bookingId: this.reviewBookingId,
        rating: this.reviewRating,
        comment: this.reviewComment || ''
      };

      this.clientProfileService.createReview(reviewData).subscribe({
        next: (response) => {
          console.log('Review submitted successfully:', response);
          this.isSubmittingReview = false;
          this.closeReviewModal();
          
          if (response.message.includes('successfully')) {
            this.showSuccessMessage('Review submitted successfully!');
          } 
          else {
            this.showAlertMessage(response.message || 'Failed to submit review');
          }
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.isSubmittingReview = false;
          
          let errorMessage = 'An error occurred while submitting the review';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
            
            // التحقق من نص الرسالة لتحديد نوع الخطأ
            if (errorMessage.includes('already reviewed')) {
              errorMessage = 'You have already reviewed this booking';
            } else if (errorMessage.includes('Booking not found')) {
              errorMessage = 'Booking not found';
            }
          } else if (error.status === 400) {
            // معالجة خاصة للـ 400 errors
            errorMessage = 'Invalid request or you have already reviewed this booking';
          }
          
          this.showAlertMessage(errorMessage);
        }
      });
    }
  }

  // Success Dialog Methods
  showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccessDialog = true;
  }

  closeSuccessDialog() {
    this.showSuccessDialog = false;
    this.successMessage = '';
  }

  // Alert Dialog Methods
  showAlertMessage(message: string) {
    this.alertMessage = message;
    this.showAlertDialog = true;
  }

  closeAlertDialog() {
    this.showAlertDialog = false;
    this.alertMessage = '';
  }
}