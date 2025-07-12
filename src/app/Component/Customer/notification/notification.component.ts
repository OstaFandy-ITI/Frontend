import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from './../services/notification.service';
import {
  Notification,
  CreateBookingDTO,
  QuoteResponseDTO,
} from '../../../core/models/notification.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  loading = false;
  userId: number;
  newlyReadNotifications: Set<number> = new Set();
  // Multi-step quote acceptance flow
  // showDatePicker = false;
  // showTimeSlots = false;
  // selectedQuote: any = null;
  // selectedTime: string = '';
  // availableTimeSlots: any[] = [];
  processingQuote = false;
  // loadingTimeSlots = false;
  // selectedDate: string = '';
  // minDate: string;
  @Input() NotificationId!: number;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // this.minDate = new Date().toISOString().slice(0, 16);
    this.userId = this.authService.getCurrentUserId() ?? 0;
    // this.selectedDate = new Date().toISOString().slice(0, 10);
  }

  ngOnInit() {
    this.loadNotifications();

    const userId = this.authService.getCurrentUserId() ?? 0;
    this.notificationService.startConnection(userId);

    if (userId) {
      this.notificationService.startConnection(userId);

      // Listen for quote notifications (from SendNotificationToClient)
      this.notificationService.onQuoteNotification((message: string) => {
        this.toastr.success(message, 'New Quote');
        this.loadNotifications(); // Refresh notifications list
      });

      // Listen for quote responses (from SendQuoteResponse)
      this.notificationService.onQuoteResponse(
        (quoteId: number, action: string, message: string) => {
          console.log('Quote response received:', quoteId, action, message);
          this.toastr.success(message, 'Quote Update');
          this.loadNotifications(); // Refresh notifications list
        }
      );
    }

    this.notificationService.onJobUpdate((jobId: number, status: string) => {
      console.log('Job status update received:', jobId, status);
      this.toastr.info(
        `Job ${jobId} status changed to ${status}`,
        'Job Status Updated'
      );
      this.loadNotifications();
    });
  }
  loadNotifications() {
    this.loading = true;
    console.log('Loading notifications for userId:', this.userId);
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (notifications) => {
        console.log('Raw API Response:', notifications);
        this.notifications = notifications;
        this.unreadCount = notifications.filter((n) => !n.isRead).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      },
    });
  }

  // toggleDropdown() {
  //     this.isDropdownOpen = !this.isDropdownOpen;
  // }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;

    // if (this.isDropdownOpen && this.unreadCount > 0) {
    //   this.markAllAsRead();
    // }
  }
  private markAllAsRead() {
    //   const clientUserId = this.authService.getCurrentUserId();

    this.notificationService.markAllNotificationsAsRead(this.userId).subscribe({
      next: () => {
        // Mark newly read notifications for styling
        this.notifications.forEach((n) => {
          if (!n.isRead) {
            this.newlyReadNotifications.add(n.id);
            n.isRead = true;
          }
        });
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
      },
    });
  }

  approve(notification: Notification) {
    this.handleJobStatusApproval(notification);
  }

  dismiss(notification: Notification) {
    this.handleJobStatusDismissal(notification);
  }

  isNewlyRead(notificationId: number): boolean {
    return this.newlyReadNotifications.has(notificationId);
  }
  private handleJobStatusApproval(notification: Notification) {
    const jobId = parseInt(notification.type.split(',')[0]) || 0;
    const requestedStatus = notification.type.split(',')[1];

    this.notificationService
      .approveJobStatus(jobId, requestedStatus, this.userId)
      .subscribe({
        next: (response) => {
          console.log('Job status approved successfully');
          notification.isRead = true;
          notification.actionTaken = 'approved';
          notification.currentJobStatus = requestedStatus;
          this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
        },
        error: (error) => {
          console.error('Error approving job status:', error);
        },
      });
  }

  private handleJobStatusDismissal(notification: Notification) {
    this.notificationService.markNotificationAsRead(notification.id).subscribe({
      next: (response) => {
        notification.isRead = true;
        notification.actionTaken = 'dismissed';
        this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
      },
      error: (error) => {
        console.error('Error dismissing notification:', error);
      },
    });
  }

  getRequestedStatus(notification: Notification): string {
    const parts = notification.type.split(',');
    return parts.length > 1 ? parts[1] : '';
  }

  isQuoteNotification(notification: Notification): boolean {
    return notification.type === 'QuoteApproval';
  }

  isQuoteStatusNotification(notification: Notification): boolean {
    return (
      notification.type === 'QuoteStatusChange' ||
      notification.type.includes('QuoteStatusChange')
    );
  }

  getActionButtonText(notification: Notification): {
    approve: string;
    dismiss: string;
  } {
    if (this.isQuoteNotification(notification)) {
      return { approve: 'Accept Quote', dismiss: 'Reject Quote' };
    } else if (this.isQuoteStatusNotification(notification)) {
      return { approve: 'Approve Quote Status', dismiss: 'Dismiss' };
    } else {
      return { approve: 'Approve', dismiss: 'Dismiss' };
    }
  }
}
