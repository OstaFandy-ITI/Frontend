import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientQuote } from '../../../core/models/ClientProfile.model';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-client-quotes',
  standalone: true, // Mark component as standalone
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './client-quotes.component.html',
  styleUrls: ['./client-quotes.component.css']
})
export class ClientQuotesComponent implements OnInit, OnDestroy {
  quotes: ClientQuote[] = [];
  filteredQuotes: ClientQuote[] = []; // New array for filtered quotes
  currentPage = 1;
  pageSize = 2;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  // New property for service filter
  selectedService: string = '';
  availableServices: string[] = []; // To store unique services for the dropdown

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
            this.extractAvailableServices(this.quotes); // Extract services after loading quotes
            this.applyFilter(); // Apply initial filter (no filter)
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

  private extractAvailableServices(quotes: ClientQuote[]) {
    const services = new Set<string>();
    quotes.forEach(quote => {
      quote.services.forEach(service => services.add(service));
    });
    this.availableServices = Array.from(services).sort();
  }

  applyFilter() {
    this.currentPage = 1; // Reset to first page on filter change
    if (this.selectedService) {
      this.filteredQuotes = this.quotes.filter(quote => 
        quote.services.includes(this.selectedService)
      );
    } else {
      this.filteredQuotes = [...this.quotes]; // If no service selected, show all quotes
    }
  }

  pagedQuotes() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredQuotes.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredQuotes.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
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

  // Track by function for ngFor to improve performance
  trackByQuoteId(index: number, quote: ClientQuote): number {
    return quote.quoteId;
  }
}