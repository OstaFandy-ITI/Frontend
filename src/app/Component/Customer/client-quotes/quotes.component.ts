import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientQuote } from '../../../core/models/ClientProfile.model';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-client-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './client-quotes.component.html',
  styleUrls: ['./client-quotes.component.css']
})
export class ClientQuotesComponent implements OnInit, OnDestroy {
  quotes: ClientQuote[] = [];
  currentPage = 1;
  pageSize = 2;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  selectedStatus: string = 'All'; 

  constructor(
    private clientProfileService: ClientProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadQuotes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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