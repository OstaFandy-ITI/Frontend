import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminNotificationService } from '../services/admin-notification.service';
import { Notification, VacationRequest } from '../../../core/models/AdminNotification.model';

@Component({
  selector: 'app-admin-notification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-notification.component.html',
  styleUrl: './admin-notification.component.css'
})
export class AdminNotificationComponent implements OnInit {
  userId: number;
  notifications: Notification[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  isProcessing = false;
  newlyReadNotifications: Set<number> = new Set();
  constructor(
    private notificationService: AdminNotificationService, 
    private authService: AuthService, 
    private toastr: ToastrService
  ) {
    this.userId = this.authService.getCurrentUserId() ?? 0;
    this.loadNotifications()
  }
    
  ngOnInit() {
    this.notificationService.startConnection(this.userId);
    this.notificationService.onAdminNotification((message) => {
      this.toastr.success(`New notification: ${message}`);
    });
  
  }

  loadNotifications() {
     this.notificationService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.isRead).length;
       },
      error: (error) => {
        console.error('Error loading notifications:', error);
         this.toastr.error('Failed to load notifications');
      }
    });
  }
  toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
  
  if (this.isDropdownOpen && this.unreadCount > 0) {
    this.markAllAsRead();
  }
}private markAllAsRead() {
  this.notificationService.markAllNotificationsAsRead(this.userId).subscribe({
    next: () => {
       this.notifications.forEach(n => {
        if (!n.isRead) {
          this.newlyReadNotifications.add(n.id);
          n.isRead = true;
        }
      });
      this.unreadCount = 0;
    },
    error: (error) => {
      console.error('Error marking notifications as read:', error);
      this.toastr.error('Failed to mark notifications as read');
    }
  });
}
isNewlyRead(notificationId: number): boolean {
  return this.newlyReadNotifications.has(notificationId);
}
  isVacationNotification(notification: Notification): boolean {
    return notification.type.includes(',') && notification.type.split(',').length === 4;
  }

  parseVacationRequest(notification: Notification): VacationRequest | null {
    if (!this.isVacationNotification(notification)) {
      return null;
    }

    const parts = notification.type.split(',');
    return {
      handymanId: parseInt(parts[0]),
      reason: parts[1],
      startDate: parts[2],
      endDate: parts[3]
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getHandymanName(message: string): string {
    const nameMatch = message.match(/name\s+(\w+\s*\w*)/i);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  getSpecialization(message: string): string {
    const specMatch = message.match(/specialization\s+(\w+)/i);
    return specMatch ? specMatch[1] : 'Unknown';
  }

  formatVacationMessage(notification: Notification): string {
  const vacationRequest = this.parseVacationRequest(notification);
  if (!vacationRequest) return notification.message;

  const handymanName = this.getHandymanName(notification.message);
  const specialization = this.getSpecialization(notification.message);
  
  return `handyman with Id ${vacationRequest.handymanId} and name ${handymanName} in specialize ${specialization} applied for a days OFF from ${vacationRequest.startDate} to ${vacationRequest.endDate} the reason is ${vacationRequest.reason}waiting for your approve`;
}

  approveVacation(notification: Notification) {
    const vacationRequest = this.parseVacationRequest(notification);
    if (!vacationRequest) return;

    this.notificationService.approveBlockDate(
      vacationRequest.handymanId,
      vacationRequest.reason,
      vacationRequest.startDate,
      vacationRequest.endDate
    ).subscribe({
      next: () => {
        notification.actionStatus  = 'approved';
        this.toastr.success(`Vacation request approved for ${this.getHandymanName(notification.message)}`);
      },
      error: (error) => {
        console.error('Error approving vacation:', error);
        this.isProcessing = false;
        this.toastr.error('Failed to approve vacation request');
      }
    });
  }

  rejectVacation(notification: Notification) {
    const vacationRequest = this.parseVacationRequest(notification);
    if (!vacationRequest) return;

    this.notificationService.rejectBlockDate(
      vacationRequest.handymanId,
      vacationRequest.reason,
      vacationRequest.startDate,
      vacationRequest.endDate
    ).subscribe({
      next: () => {
        notification.actionStatus  = 'rejected';
        this.toastr.success(`Vacation request rejected for ${this.getHandymanName(notification.message)}`);
      },
      error: (error) => {
        console.error('Error rejecting vacation:', error);
        this.toastr.error('Failed to reject vacation request');
      }
    });
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}