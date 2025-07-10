import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HandymanBlockDateService } from '../services/HandymanBlockDate.service';
import { 
  HandymanBlockDateDTO, 
  ApplyBlockDateRequest, 
  HandymanInfo 
} from '../../../core/models/BlockDateForHandyman.model';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-handyman-block-date',
  templateUrl: './handyman-block-date.component.html',
  styleUrls: ['./handyman-block-date.component.css'],
  imports: [CommonModule, FormsModule]
})
export class HandymanBlockDateComponent implements OnInit, OnDestroy {

  blockDates: HandymanBlockDateDTO[] = [];
  
  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  pageSize: number = 5;
  
  statusFilter: string = '';
  dateFilter: string = '';
  
  blockDateForm = {
    reason: '',
    startDate: '',
    endDate: ''
  };
  
  isLoading = false;
  isApplying = false;
  
  
  private hubConnection!: signalR.HubConnection;

  userId: number = 0;

  constructor(private handymanService: HandymanBlockDateService, private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId() || 0;
    this.loadBlockDates();
    this.startSignalRConnection();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  private startSignalRConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/notificationHub')
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        
        this.hubConnection.on('ReceiveNotificationhandyman', (message: string) => {
          this.toastr.success(message, 'Success');
        });
      })
      .catch(err => console.error('SignalR Connection Error: ', err));
  }

  get isFormValid(): boolean {
    return !!(this.blockDateForm.reason && 
             this.blockDateForm.startDate && 
             this.blockDateForm.endDate && 
             this.blockDateForm.startDate <= this.blockDateForm.endDate);
  }

  get isDateRangeValid(): boolean {
    if (!this.blockDateForm.startDate || !this.blockDateForm.endDate) {
      return true; 
    }
    return this.blockDateForm.startDate <= this.blockDateForm.endDate;
  }

  loadBlockDates(): void {
    this.isLoading = true;
    this.handymanService.getHandymanBlockDate(
      this.userId,
      this.currentPage,
      this.pageSize,
      this.statusFilter || undefined,
      this.dateFilter || undefined
    ).subscribe({
      next: (result) => {
        this.blockDates = result.data;
        this.currentPage = result.currentPage;
        this.totalPages = result.totalPages;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading block dates:', error);
        this.toastr.error('Error loading block dates', 'Error');
        this.isLoading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadBlockDates();
  }

  onDateFilterChange(): void {
    this.currentPage = 1;
    this.loadBlockDates();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBlockDates();
  }

  openApplyModal(): void {
    this.blockDateForm = {
      reason: '',
      startDate: '',
      endDate: ''
    };
    
    const modal = new bootstrap.Modal(document.getElementById('applyBlockDateModal'));
    modal.show();
  }

  applyForBlockDate(): void {
    if (!this.isFormValid) {
      this.toastr.warning('Please fill all required fields correctly', 'error');
      return;
    }

    if (!this.isDateRangeValid) {
      this.toastr.warning('End date must be after or equal to start date', 'error');
    return;
  }
    if (!this.blockDateForm.reason || !this.blockDateForm.startDate || !this.blockDateForm.endDate) {
      this.toastr.warning('Please fill all required fields', 'error');
      return;
    }

    this.isApplying = true;
    const request: ApplyBlockDateRequest = {
      handymanId: this.userId,
      reason: this.blockDateForm.reason,
      startDate: this.blockDateForm.startDate,
      endDate: this.blockDateForm.endDate
    };

    this.handymanService.applyForBlockDate(request).subscribe({
      next: (response) => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('applyBlockDateModal'));
        if (modal) {
          modal.hide();
        }
        // this.toastr.success('Days OFF request submitted successfully', 'Success');
        this.isApplying = false;
        this.loadBlockDates();
      },
      error: (error) => {
        console.error('Error applying for block date:', error);
        this.toastr.error('Failed to submit request', 'Error');
        this.isApplying = false;
      }
    });
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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