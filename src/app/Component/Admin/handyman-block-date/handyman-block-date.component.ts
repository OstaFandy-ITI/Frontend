import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HandymanBlockDateService } from '../services/BlockDate.service';
import {
  HandymanSummaryDTO,
  Category,
  BlockDateDTO,
  PaginationHelper,
  AddBlockDateRequest,
} from '../../../core/models/BlockDate.model';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import * as signalR from '@microsoft/signalr';
declare var bootstrap: any;

@Component({
  selector: 'app-handyman-block-date',
  templateUrl: './handyman-block-date.component.html',
  styleUrls: ['./handyman-block-date.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class HandymanBlockDateComponent implements OnInit, OnDestroy {
  activeTab: 'handymen' | 'blockDates' = 'handymen';
  handymen: HandymanSummaryDTO[] = [];
  categories: Category[] = [];
  selectedHandyman: HandymanSummaryDTO | null = null;

  blockDates: BlockDateDTO[] = [];
  private hubConnection!: signalR.HubConnection;
  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  pageSize: number = 5;

  blockDatesCurrentPage: number = 1;
  blockDatesTotalPages: number = 1;
  blockDatesTotalCount: number = 0;
  blockDatesPageSize: number = 5;

  searchString: string = '';
  selectedCategoryId: number | null = null;
  statusFilter: string = '';
  dateFilter: string = '';
  blockDatesSearchString: string = '';

  blockDateForm = {
    reason: '',
    startDate: '',
    endDate: '',
  };

  today!: string;

  isBlockDatesLoading = false;

  constructor(
    private handymanService: HandymanBlockDateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadHandymen();
    this.loadBlockDates();
    this.startSignalRConnection();
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    this.today = `${now.getFullYear()}-${month}-${day}`;
  }
  private startSignalRConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/notificationHub')
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');

        this.hubConnection.on(
          'ReceiveNotificationhandyman',
          (message: string) => {
            this.toastr.success(message, 'Success');
          }
        );
      })
      .catch((err) => console.error('SignalR Connection Error: ', err));
  }

  switchTab(tab: 'handymen' | 'blockDates'): void {
    this.activeTab = tab;
    if (tab === 'handymen') {
      this.loadHandymen();
    } else {
      this.loadBlockDates();
    }
  }
  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  loadCategories(): void {
    this.handymanService.getCategoriesForDropdown().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error('Error loading categories', 'Error');
      },
    });
  }

  loadHandymen(): void {
    // this.isLoading = true;
    this.handymanService
      .getAllHandymanData(
        this.searchString,
        this.currentPage,
        this.pageSize,
        this.selectedCategoryId || undefined
      )
      .subscribe({
        next: (result) => {
          this.handymen = result.data;
          this.currentPage = result.currentPage;
          this.totalPages = result.totalPages;
          this.totalCount = result.totalCount;
          // this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading handymen:', error);
          this.toastr.error('Error loading handymen', 'Error');
          // this.isLoading = false;
        },
      });
  }

  loadBlockDates(): void {
    this.isBlockDatesLoading = true;
    this.handymanService
      .getAllBlockDates(
        this.blockDatesSearchString,
        this.blockDatesCurrentPage,
        this.blockDatesPageSize,
        this.statusFilter || undefined,
        this.dateFilter || undefined
      )
      .subscribe({
        next: (result) => {
          this.blockDates = result.data;
          this.blockDatesCurrentPage = result.currentPage;
          this.blockDatesTotalPages = result.totalPages;
          this.blockDatesTotalCount = result.totalCount;
          this.isBlockDatesLoading = false;
        },
        error: (error) => {
          console.error('Error loading block dates:', error);
          this.toastr.error('Error loading block dates', 'error');
          this.isBlockDatesLoading = false;
        },
      });
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadHandymen();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadHandymen();
  }

  onBlockDatesSearch(): void {
    this.blockDatesCurrentPage = 1;
    this.loadBlockDates();
  }

  onStatusFilterChange(): void {
    this.blockDatesCurrentPage = 1;
    this.loadBlockDates();
  }

  onDateFilterChange(): void {
    this.blockDatesCurrentPage = 1;
    this.loadBlockDates();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHandymen();
  }

  onBlockDatesPageChange(page: number): void {
    this.blockDatesCurrentPage = page;
    this.loadBlockDates();
  }

  openBlockDateModal(handyman: HandymanSummaryDTO): void {
    this.selectedHandyman = handyman;
    this.blockDateForm = {
      reason: '',
      startDate: '',
      endDate: '',
    };

    const modal = new bootstrap.Modal(
      document.getElementById('blockDateModal')
    );
    modal.show();
  }

  submitBlockDate(): void {
    if (
      !this.selectedHandyman ||
      !this.blockDateForm.reason ||
      !this.blockDateForm.startDate ||
      !this.blockDateForm.endDate
    ) {
      this.toastr.info('Please fill all required fields', 'error');
      return;
    }

    const request: AddBlockDateRequest = {
      handymanId: this.selectedHandyman.userId,
      reason: this.blockDateForm.reason,
      startDate: this.blockDateForm.startDate,
      endDate: this.blockDateForm.endDate,
    };

    this.handymanService.addBlockDate(request).subscribe({
      next: (response) => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('blockDateModal')
        );
        if (modal) {
          modal.hide();
        }
        this.toastr.success('Block date created successfully', 'success');
        this.loadHandymen();
        this.loadBlockDates();
      },
      error: (error) => {
        console.error('Error creating block date:', error);
        this.toastr.error('Failed to create block date', 'error');
      },
    });
  }

  // Utility methods
  getPageNumbers(): number[] {
    const totalPages =
      this.activeTab === 'handymen'
        ? this.totalPages
        : this.blockDatesTotalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'badge-success';
      case 'denied':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }
}
