import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientQuote } from '../../../core/models/ClientProfile.model';

@Component({
  selector: 'app-client-quotes',
  imports: [CommonModule],
  templateUrl: './client-quotes.component.html',
  styleUrls: ['./client-quotes.component.css']
})
export class ClientQuotesComponent implements OnInit, OnDestroy {
  quotes: ClientQuote[] = [];
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

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

  // Track by function for ngFor to improve performance
  trackByQuoteId(index: number, quote: ClientQuote): number {
    return quote.quoteId;
  }
}