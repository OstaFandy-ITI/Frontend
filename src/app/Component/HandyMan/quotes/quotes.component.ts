// components/handyman-quotes.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Subject, takeUntil } from 'rxjs';
import { QuotesService } from '../services/quotes.service'; 
import { AllQuotes } from '../../../core/models/handyman-quotes.model';
import { AuthService } from '../../../core/services/auth.service'; 

@Component({
  selector: 'app-handyman-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.css'],
  standalone: true,
  imports: [CommonModule] 
})
export class QuotesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  quotes: AllQuotes[] = [];
  handyId: number = 0;
  isLoading: boolean = false;
  error: string = '';
  noDataMessage: string = '';

  constructor(
    private quotesService: QuotesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeHandymanId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeHandymanId(): void {
    this.authService.CurrentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.handyId = Number(user?.NameIdentifier);
        console.log(this.handyId);
        if (this.handyId) {
          this.loadQuotes();
        }
      });
  }

  private loadQuotes(): void {
    if (this.handyId <= 0) return;

    this.isLoading = true;
    this.error = '';
    this.noDataMessage = '';

    this.quotesService.getHandymanQuotes(this.handyId, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.quotes = response.data || [];
          if (this.quotes.length === 0) {
            this.noDataMessage = response.message || 'No quotes found';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading quotes:', error);
          this.error = 'Failed to load quotes. Please try again.';
          this.isLoading = false;
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'Accepted Quote';
      case 'rejected':
        return 'Rejected Quote';
      case 'pending':
      default:
        return 'Pending Quote';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  refreshQuotes(): void {
    this.loadQuotes();
  }
}