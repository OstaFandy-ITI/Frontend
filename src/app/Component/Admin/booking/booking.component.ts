import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import {bookingFilterDto,BookingViewModel,} from '../../../core/models/Booking.model';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
declare var bootstrap: any;

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule,MatButtonToggleModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit {
  bookings: BookingViewModel[] = [];
  currentView: 'table' | 'calendar' = 'calendar';
  
  // Delete confirmation modal instance
  private deleteModalInstance: any;

  constructor(private bookingSerivce: BookingService,private sanitizer: DomSanitizer,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.getAllBookings();
    this.getPaginationbooking();
  }

  toggle() {
    if (this.currentView == 'calendar') {
      this.getAllBookings();
    }
    this.currentView = this.currentView === 'calendar' ? 'table' : 'calendar';
  }

  getAllBookings() {
    this.bookingSerivce.GetAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        this.initializeCalendar();
      },
      error: (error) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }

  initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: this.bookings.map((booking) => {
        const startDate = booking.preferredDate
          ? new Date(booking.preferredDate + 'Z')
          : undefined;
        const endDate = startDate
          ? new Date(
              startDate.getTime() + (booking.estimatedMinutes ?? 0) * 60000
            )
          : undefined;

        return {
          title: `${booking.categoryName} - ${booking.handymanName}`,
          start: startDate,
          end: endDate,
          extendedProps: {
            clientName: booking.clientName,
            categoryName: booking.categoryName,
            handymanName: booking.handymanName,
            serviceNames: booking.serviceNames?.join(', '),
            note: booking.note,
            status: booking.status,
          },
        };
      }),
      eventClick: (info) => {
        const props = info.event.extendedProps;
        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
          modalBody.innerHTML = `
            <p><strong>Client Name:</strong> ${props['clientName']}</p>
            <p><strong>Handyman Name:</strong> ${props['handymanName']}</p>
            <p><strong>Category:</strong> ${props['categoryName']}</p>
            <p><strong>Services:</strong> ${props['serviceNames']}</p>
            <p><strong>Note:</strong> ${props['note']}</p>
            <p><strong>Status:</strong> ${props['status']}</p>
          `;
        }
        const modalElement = document.getElementById('eventModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      },
    });

    calendar.render();
  }

  //#region table part
  pagedbooking: BookingViewModel[] = [];
  selectedpagedbooking: BookingViewModel | null = null;
  loading = false;
  error: string | null = null;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  Math = Math;

  filter: bookingFilterDto = {
    pageNumber: '',
    pageSize: '',
    handymanName: '',
    status: 'Confirmed',
    isActive: true,
  };
  
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  getPaginationbooking() {
    this.loading = true;
    this.error = null;

    this.filter.pageNumber = this.pageNumber.toString();
    this.filter.pageSize = this.pageSize.toString();

    this.bookingSerivce.getPaginated(this.filter).subscribe({
      next: (res) => {
        this.pagedbooking = res.items;
        this.totalCount = res.totalItems;
        this.pageNumber = res.pageNumber;
        this.pageSize = res.pageSize;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.hasNextPage = this.pageNumber < this.totalPages;
        this.hasPreviousPage = this.pageNumber > 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading bookings';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // helper function
  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting() {
    this.pagedbooking.sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }

  isColumnSorted(column: string): boolean {
    return this.sortColumn === column;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bi bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  getStatusBadgeClass(status?: string) {
    switch (status) {
      case 'Pending':
        return 'badge bg-warning text-dark';
      case 'Confirmed':
        return 'badge bg-primary';
      case 'Completed':
        return 'badge bg-success';
      case 'Cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  viewBookingDetails(booking: BookingViewModel) {
    this.selectedpagedbooking = booking;
  }

  // New Delete Confirmation Modal Method
  confirmCancelBooking(booking: BookingViewModel): void {
    this.selectedpagedbooking = booking;

    const modalElement = document.getElementById('cancelConfirmModal');
    if (modalElement) {
      if (this.deleteModalInstance) {
        this.deleteModalInstance.dispose();
      }
      this.deleteModalInstance = new bootstrap.Modal(modalElement);
      this.deleteModalInstance.show();
    }
  }

  // Proceed with cancellation
  proceedCancel(): void {
    if (!this.selectedpagedbooking || !this.selectedpagedbooking.id) return;

    this.CancelBooking(this.selectedpagedbooking.id);

    if (this.deleteModalInstance) {
      this.deleteModalInstance.hide();
    }
  }

  // Updated Cancel Booking Method
  CancelBooking(bookingId: number) {
    this.loading = true;
    
    this.bookingSerivce.CancelBooking(bookingId).subscribe({
      next: (res) => {
        // Smart pagination handling
        const remainingBookingsOnCurrentPage = this.pagedbooking.length - 1;
        if (remainingBookingsOnCurrentPage === 0 && this.pageNumber > 1) {
          this.pageNumber = this.pageNumber - 1;
        }
        
        this.getPaginationbooking();
        this.toastr.success(res.message || 'Booking cancelled successfully', 'Success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.toastr.error(err.error?.message || 'Failed to cancel booking', 'Error');
        this.loading = false;
      }
    });
  }

  getMapUrl(lat?: number, lng?: number): SafeResourceUrl {
    if (lat == null || lng == null) return '';
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeModal() {
    this.selectedpagedbooking = null;
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.getPaginationbooking();
  }

  onSearchChange() {
    this.pageNumber = 1;
    this.getPaginationbooking();
  }

  previousPage() {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.getPaginationbooking();
    }
  }

  nextPage() {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.getPaginationbooking();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.getPaginationbooking();
    }
  }

  // Cleanup method
  ngOnDestroy(): void {
    if (this.deleteModalInstance) {
      this.deleteModalInstance.dispose();
    }
  }
  //#endregion
}