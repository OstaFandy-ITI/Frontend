// components/order-feedback/order-feedback.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderFeedbackService } from '../../Admin/services/order-feedback.service.service';
import { OrderFeedback, OrderFeedbackResponse, OrderFeedbackFilters } from '../../../core/models/Orderfeedback';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-order-feedback',
  templateUrl: './order-feedback.component.component.html',
  styleUrls: ['./order-feedback.component.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class OrderFeedbackComponent implements OnInit, OnDestroy {
  ordersFeedback: OrderFeedback[] = [];
  allOrdersFeedback: OrderFeedback[] = [];  
  filteredOrdersFeedback: OrderFeedback[] = [];
  loading = false;
  error = '';
  
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  paginationPages: number[] = [];
  
  searchControl = new FormControl('');
  selectedService = '';
  selectedRating = '';
  uniqueServices: string[] = [];
  
  selectedFeedback: OrderFeedback | null = null;
  showModal = false;

  private hasActiveFilters = false;

  private destroy$ = new Subject<void>();

  constructor(private orderFeedbackService: OrderFeedbackService) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadOrdersFeedback();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchValue => {
        this.onSearch(searchValue || '');
      });
  }

  loadOrdersFeedback(): void {
    this.loading = true;
    this.error = '';
    
    const filters: OrderFeedbackFilters = {
      searchString: this.searchControl.value || '',
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.orderFeedbackService.getAllOrdersFeedback(filters).subscribe({
      next: (response: OrderFeedbackResponse) => {
        this.allOrdersFeedback = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.uniqueServices = this.orderFeedbackService.getUniqueServices(response.data);
        
        this.hasActiveFilters = !!(this.selectedService || this.selectedRating);
        
        if (this.hasActiveFilters) {
          this.applyClientSideFilters();
        } else {
          this.ordersFeedback = this.allOrdersFeedback;
          this.updatePaginationPages();
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders feedback';
        this.loading = false;
        console.error('Error loading orders feedback:', error);
      }
    });
  }

  onSearch(searchValue: string): void {
    this.currentPage = 1;
    this.selectedService = '';
    this.selectedRating = '';
    this.hasActiveFilters = false;
    this.loadOrdersFeedback();
  }

  onServiceFilterChange(value: string): void {
    this.selectedService = value;
    this.currentPage = 1;
    this.hasActiveFilters = !!(value || this.selectedRating);
    
    if (this.hasActiveFilters) {
      this.loadAllDataForFiltering();
    } else {
      this.loadOrdersFeedback();
    }
  }

  onRatingFilterChange(value: string): void {
    this.selectedRating = value;
    this.currentPage = 1;
    this.hasActiveFilters = !!(this.selectedService || value);
    
    if (this.hasActiveFilters) {
      this.loadAllDataForFiltering();
    } else {
      this.loadOrdersFeedback();
    }
  }

  loadAllDataForFiltering(): void {
    this.loading = true;
    this.error = '';
    
    const filters: OrderFeedbackFilters = {
      searchString: this.searchControl.value || '',
      pageNumber: 1,
      pageSize: 1000
    };

    this.orderFeedbackService.getAllOrdersFeedback(filters).subscribe({
      next: (response: OrderFeedbackResponse) => {
        this.allOrdersFeedback = response.data;
        this.uniqueServices = this.orderFeedbackService.getUniqueServices(response.data);
        
        // Apply client-side filters
        this.applyClientSideFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders feedback';
        this.loading = false;
        console.error('Error loading orders feedback:', error);
      }
    });
  }

  applyClientSideFilters(): void {
    let filteredData = [...this.allOrdersFeedback];
    
    if (this.selectedService) {
      filteredData = filteredData.filter(item => 
        item.serviceName.toLowerCase().includes(this.selectedService.toLowerCase())
      );
    }
    
    if (this.selectedRating) {
      filteredData = filteredData.filter(item => 
        item.rating === parseInt(this.selectedRating)
      );
    }
    
    this.filteredOrdersFeedback = filteredData;
    
    this.totalCount = filteredData.length;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    
    this.getCurrentPageData();
    this.updatePaginationPages();
  }

  getCurrentPageData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.ordersFeedback = this.filteredOrdersFeedback.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    
    if (this.hasActiveFilters) {
      this.getCurrentPageData();
      this.updatePaginationPages();
    } else {
      this.loadOrdersFeedback();
    }
  }

  updatePaginationPages(): void {
    this.paginationPages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      this.paginationPages.push(i);
    }
  }

  getStarRating(rating: number): boolean[] {
    return this.orderFeedbackService.getStarRating(rating);
  }

  showDetails(feedback: OrderFeedback): void {
    this.selectedFeedback = feedback;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFeedback = null;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateText(text: string, maxLength: number = 30): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  trackByBookingId(index: number, item: OrderFeedback): number {
    return item.bookingId;
  }

  clearFilters(): void {
    this.selectedService = '';
    this.selectedRating = '';
    this.searchControl.setValue('');
    this.currentPage = 1;
    this.hasActiveFilters = false;
    this.loadOrdersFeedback();
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 4) return 'badge bg-success';
    if (rating >= 3) return 'badge bg-warning';
    return 'badge bg-danger';
  }

  // Helper method to get pagination info text
  getPaginationInfo(): string {
    if (this.totalCount === 0) return 'No entries found';
    
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);
    return `Showing ${start} to ${end} of ${this.totalCount} entries`;
  }

  shouldShowPagination(): boolean {
    return !this.loading && !this.error && this.totalPages > 1;
  }
}