import { Component, OnInit } from '@angular/core';
import { ClientProfileService } from '../services/client-profile.service';
import { BookingService } from '../../Admin/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateReviewRequest } from '../../../core/models/ClientProfile.model';
import { ToastrService } from 'ngx-toastr';

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
    private authService: AuthService,
    private toastr: ToastrService
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

  pagedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.orders.length / this.pageSize);
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
          this.orders = this.orders.map(order =>
            order.bookingId === this.bookingToCancelId ? { ...order, status: 'Cancelled' } : order
          );
          
          this.cancellingId = null;
          this.closeCancelModal();
          this.toastr.success(response.message || 'Booking cancelled successfully');
        },
        error: (error) => {
          this.toastr.error(error.error.message || 'Failed to cancel booking');
          this.cancellingId = null;
        }
      });
    }
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.bookingToCancelId = null; 
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