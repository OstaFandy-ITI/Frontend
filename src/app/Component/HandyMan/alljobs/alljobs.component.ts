import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  JobAssignment, AllJobsResponse, AddQuoteRequest } from '../../../core/models/Handyman.model';
import { AlljobsService } from '../services/alljobs.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-alljobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alljobs.component.html',
  styleUrl: './alljobs.component.css'
})
export class AllJobsComponent implements OnInit {
  
  handymanId!: number;
  Math = Math; // Make Math available in template
  jobs: JobAssignment[] = [];
  isLoading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  pageSize: number = 10; // Set default page size
  
  // Filters
  selectedStatus: string = '';
  searchTerm: string = '';
  statusOptions = ['Assigned', 'InProgress', 'Completed', 'Cancelled'];

  // Confirmation dialog properties
  showConfirmationDialog: boolean = false;
  confirmationMessage: string = '';
  pendingStatusChange: {
    job: JobAssignment;
    newStatus: string;
    originalStatus: string;
  } | null = null;

  // Success dialog properties
  showSuccessDialog: boolean = false;
  successMessage: string = '';

  // Alert dialog properties
  showAlertDialog: boolean = false;
  alertMessage: string = '';

  // Add Quote Modal properties
  showAddQuoteModal: boolean = false;
  selectedJobForQuote: JobAssignment | null = null;
  quoteForm = {
    jobId: 0,
    price: 0,
    notes: ''
  };
  isSubmittingQuote: boolean = false;

  constructor(
    private alljobsService: AlljobsService,
    private authService: AuthService
  ) {
    this.authService.CurrentUser$.subscribe((user) => {
      this.handymanId = Number(user?.NameIdentifier);
      console.log('HandymanId:', this.handymanId);
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    if (!this.handymanId) return;
    
    this.isLoading = true;
    
    this.alljobsService.getAllJobs(
      this.handymanId,
      this.currentPage,
      this.pageSize,
      this.selectedStatus,
      this.searchTerm
    ).subscribe({
      next: (response: AllJobsResponse) => {
        this.jobs = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.isLoading = false;
        console.log('Jobs loaded:', response);
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.isLoading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadJobs();
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadJobs();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadJobs();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadJobs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadJobs();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Assigned':
        return 'badge bg-primary';
      case 'InProgress':
        return 'badge bg-warning';
      case 'Completed':
        return 'badge bg-success';
      case 'Cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  // Helper method to get page numbers for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Get available status options based on current status
  getAvailableStatuses(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'Assigned':
        return ['InProgress', 'Completed', 'Cancelled'];
      case 'InProgress':
        return ['Completed', 'Cancelled'];
      case 'Completed':
        return ['Assigned', 'InProgress', 'Cancelled']; // Add dummy options to show dropdown
      case 'Cancelled':
        return ['Assigned', 'InProgress', 'Completed']; // Add dummy options to show dropdown
      default:
        return [];
    }
  }

  // Handle status change - with confirmation
  onStatusChange(job: JobAssignment, newStatus: string): void {
    // Don't update if the status is the same
    if (newStatus === job.status) {
      return;
    }

    // Check if trying to change from Completed or Cancelled status
    if (job.status === 'Completed' || job.status === 'Cancelled') {
      this.showAlert(`Cannot change ${job.status} status`);
      // Reset the dropdown to original status
      const selectElement = document.querySelector(`select[data-job-id="${job.jobAssignmentId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = job.status;
      }
      return;
    }

    // Store the pending change and show confirmation dialog
    this.pendingStatusChange = {
      job: job,
      newStatus: newStatus,
      originalStatus: job.status
    };

    this.confirmationMessage = `Do you want to change the job status from "${job.status}" to "${newStatus}"?`;
    this.showConfirmationDialog = true;
  }

  // Confirm status change
  confirmStatusChange(): void {
    if (this.pendingStatusChange) {
      this.updateJobStatus(
        this.pendingStatusChange.job.jobAssignmentId, 
        this.pendingStatusChange.newStatus
      );
    }
    this.closeConfirmationDialog();
  }

  // Cancel status change
  cancelStatusChange(): void {
    if (this.pendingStatusChange) {
      // Reset the dropdown to original status
      const selectElement = document.querySelector(`select[data-job-id="${this.pendingStatusChange.job.jobAssignmentId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = this.pendingStatusChange.originalStatus;
      }
    }
    this.closeConfirmationDialog();
  }

  // Close confirmation dialog
  closeConfirmationDialog(): void {
    this.showConfirmationDialog = false;
    this.pendingStatusChange = null;
    this.confirmationMessage = '';
  }

  // Show success dialog
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessDialog = true;
  }

  // Close success dialog
  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    this.successMessage = '';
  }

  // Show alert dialog
  showAlert(message: string): void {
    this.alertMessage = message;
    this.showAlertDialog = true;
  }

  // Close alert dialog
  closeAlertDialog(): void {
    this.showAlertDialog = false;
    this.alertMessage = '';
  }

  // Update job status via API
  updateJobStatus(jobId: number, newStatus: string): void {
    console.log('Updating job status:', { jobId, newStatus }); // Debug log
    
    this.alljobsService.updateJobStatus(jobId, newStatus).subscribe({
      next: (response) => {
        console.log('Job status updated successfully:', response);
        
        // Update the local job status
        const jobIndex = this.jobs.findIndex(j => j.jobAssignmentId === jobId);
        if (jobIndex !== -1) {
          this.jobs[jobIndex].status = newStatus;
        }
        
        // Show success message
        this.showSuccess('Status change request has been submitted successfully!');

        console.log('Status updated successfully!');
      },
      error: (error) => {
        console.error('Error updating job status:', error);
        console.log('Error details:', {
          status: error.status,
          message: error.message,
          body: error.error
        });
        
        // Show error message
        this.showAlert('Failed to update job status. Please try again.');
        
        // Reload jobs to revert any UI changes
        this.loadJobs();
      }
    });
  }

  // ========== ADD QUOTE METHODS ==========

  // Check if job allows adding quotes
  canAddQuote(job: JobAssignment): boolean {
    return job.status !== 'Completed' && job.status !== 'Cancelled';
  }

  // Open Add Quote Modal
  openAddQuoteModal(job: JobAssignment): void {
    // Check if quote can be added for this job status
    if (!this.canAddQuote(job)) {
      this.showAlert(`Cannot add quote for ${job.status} jobs. Only jobs with status "Assigned" or "InProgress" can have quotes added.`);
      return;
    }

    this.selectedJobForQuote = job;
    this.quoteForm = {
      jobId: job.jobAssignmentId,
      price: 0,
      notes: ''
    };
    this.showAddQuoteModal = true;
  }

  // Close Add Quote Modal
  closeAddQuoteModal(): void {
    this.showAddQuoteModal = false;
    this.selectedJobForQuote = null;
    this.quoteForm = {
      jobId: 0,
      price: 0,
      notes: ''
    };
    this.isSubmittingQuote = false;
  }

  // Submit Quote
  submitQuote(): void {
    // Validation
    if (!this.quoteForm.price || this.quoteForm.price <= 0) {
      this.showAlert('Please enter a valid quote amount.');
      return;
    }

    if (!this.quoteForm.notes || this.quoteForm.notes.trim() === '') {
      this.showAlert('Please enter notes for the quote.');
      return;
    }

    this.isSubmittingQuote = true;

    const quoteRequest: AddQuoteRequest = {
      jobId: this.quoteForm.jobId,
      price: this.quoteForm.price,
      notes: this.quoteForm.notes.trim()
    };

    this.alljobsService.addQuote(quoteRequest).subscribe({
      next: (response) => {
        console.log('Quote added successfully:', response);
        this.showSuccess('Quote has been submitted successfully!');
        this.closeAddQuoteModal();
      },
      error: (error) => {
        console.error('Error adding quote:', error);
        this.showAlert('Failed to add quote. Please try again.');
        this.isSubmittingQuote = false;
      }
    });
  }
}