// Component/Admin/payments/payments.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { 
  PaymentDto, 
  PaymentDetailsDto, 
  PaymentFilterDto, 
  PagedPaymentResponseDto 
} from '../../../core/models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: PaymentDto[] = [];
  selectedPayment: PaymentDetailsDto | null = null;
  loading = false;
  error: string | null = null;
  
  // Make Math available in template
  Math = Math;
  
  // Sorting properties
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Filters - Start with empty filters to show all data
  filter: PaymentFilterDto = {
    status: '',
    method: '',
    searchTerm: '',
    pageNumber: 1,
    pageSize: 5 
  };

  // Options for dropdowns
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' }
  ];

  methodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Stripe', label: 'Stripe' }
  ];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = null;
    
    // Debug log to see what we're sending
    console.log('Loading payments with filter:', this.filter);

    this.paymentService.getAllPayments(this.filter).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debug log
        
        if (response.success) {
          this.payments = response.data.data;
          this.totalCount = response.data.totalCount;
          this.pageNumber = response.data.pageNumber;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.hasNextPage = response.data.hasNextPage;
          this.hasPreviousPage = response.data.hasPreviousPage;
          
          // Apply sorting after loading data
          this.applySorting();
          
          console.log('Loaded payments:', this.payments); // Debug log
        } else {
          this.error = response.message;
          console.error('API Error:', response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load payments';
        this.loading = false;
        console.error('HTTP Error:', error);
        
        // More detailed error logging
        if (error.status === 0) {
          console.error('Network error - check if API is running');
        } else if (error.status === 404) {
          console.error('API endpoint not found');
        } else if (error.status >= 500) {
          console.error('Server error');
        }
      }
    });
  }

  // New sorting method
  onSort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, start with ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applySorting();
  }

  // Apply sorting to the current data
  applySorting(): void {
    if (!this.sortColumn) return;

    this.payments.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'clientName':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'bookingId':
          aValue = a.bookingId;
          bValue = b.bookingId;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'method':
          aValue = a.method.toLowerCase();
          bValue = b.method.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        default:
          return 0;
      }

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }

  // Get sort icon class
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  // Check if column is currently sorted
  isColumnSorted(column: string): boolean {
    return this.sortColumn === column;
  }

  onFilterChange(): void {
    console.log('Filter changed:', this.filter); // Debug log
    this.filter.pageNumber = 1; // Reset to first page when filter changes
    this.loadPayments();
  }

  onSearchChange(): void {
    console.log('Search changed:', this.filter.searchTerm); // Debug log
    this.filter.pageNumber = 1; // Reset to first page when search changes
    this.loadPayments();
  }

  viewPaymentDetails(paymentId: number): void {
    console.log('Viewing payment details for ID:', paymentId); // Debug log
    
    this.paymentService.getPaymentById(paymentId).subscribe({
      next: (response) => {
        console.log('Payment details response:', response); // Debug log
        
        if (response.success) {
          this.selectedPayment = response.data;
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Failed to load payment details';
        console.error('Error loading payment details:', error);
      }
    });
  }

  closeModal(): void {
    this.selectedPayment = null;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filter.pageNumber = page;
      this.loadPayments();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.pageNumber - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.pageNumber + 1);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'badge bg-success';
      case 'pending': return 'badge bg-secondary';
      case 'failed': return 'badge bg-danger';
      case 'refunded': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  getMethodBadgeClass(method: string): string {
    switch (method.toLowerCase()) {
      case 'stripe': return 'badge bg-secondary';
      case 'cash': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}