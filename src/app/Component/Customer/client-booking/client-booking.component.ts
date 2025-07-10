import { Component, OnInit } from '@angular/core';
import { ClientProfileService } from '../services/client-profile.service';
import { BookingService } from '../../Admin/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-booking',
  standalone: true,
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
          this.orders = this.orders.map(order =>
            order.bookingId === this.bookingToCancelId ? { ...order, status: 'Cancelled' } : order
          );

          this.cancellingId = null;
          this.closeCancelModal();

          console.log(`Booking ${this.bookingToCancelId} cancelled successfully.`, response);
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          this.cancellingId = null;
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
}