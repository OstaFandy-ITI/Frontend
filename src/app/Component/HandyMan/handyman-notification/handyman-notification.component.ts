import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HandymanNotificationService } from '../services/handyman-notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-handyman-notifications',
  templateUrl: './handyman-notification.component.html',
  styleUrls: ['./handyman-notification.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ]
})
export class HandymanNotificationsComponent implements OnInit, OnDestroy {
private handymanUserId: number = 0;
  notifications: any[] = [];
showNotifications: boolean = false;
  constructor(
    private handymanNotificationService: HandymanNotificationService,
    private authService: AuthService,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.handymanUserId = this.authService.getCurrentUserId() ?? 0;
    if (this.handymanUserId === 0) {
      this.toastr.error('Unable to get user ID', 'Connection Error');
      return;
    }
    
    this.handymanNotificationService.startConnection(this.handymanUserId);
    this.setupSignalRListeners();

  }

  ngOnDestroy(): void {
    this.handymanNotificationService.stopConnection();
  }
private setupSignalRListeners(): void {
  this.handymanNotificationService.onHandymanNotification((message: string) => {
    this.ngZone.run(() => {
      const messageContent = message.toLowerCase();
      
      let title = 'Job Update';
      let toastType = 'info';
      
      if (messageContent.includes('completed')) {
        title = 'Status Approved';
        toastType = 'success';
      }
      else if (messageContent.includes('cancelled')) {
        title = 'Status Dismissed';
        toastType = 'error';
      }
      else if (messageContent.includes('updated to') || messageContent.includes('changed to')) {
        title = 'Status Changed';
        toastType = 'warning';
      }
      else {
        console.log(' DEBUG: NO CONDITION MATCHED - DEFAULTING TO INFO');
      }
      this.showNotificationToast(title, message, toastType);
    });
  });
}
  private showNotificationToast(title: string, message: string, type: string = 'info'): void {
    const toastOptions = {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      enableHtml: true
    };

    switch (type) {
      case 'success':
        this.toastr.success(message, title, toastOptions);
        break;
      case 'error':
        this.toastr.error(message, title, toastOptions);
        break;
      case 'warning':
        this.toastr.warning(message, title, toastOptions);
        break;
      case 'info':
      default:
        this.toastr.info(message, title, toastOptions);
        break;
    }
  }
  toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;
  if (this.showNotifications) {
    this.loadNotifications();
  }
}

closeNotifications(): void {
  this.showNotifications = false;
}

loadNotifications(): void {
  this.handymanNotificationService.GetNotificationsOfHandyman(this.handymanUserId)
    .subscribe({
      next: (data: any) => {
        this.notifications = data || [];
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.toastr.error('Failed to load notifications', 'Error');
      }
    });
}

getNotificationTitle(message: string): string {
  const messageContent = message.toLowerCase();
  
  if (messageContent.includes('completed')) {
    return 'Status Approved';
  } else if (messageContent.includes('cancelled')) {
    return 'Status Dismissed';
  } else if (messageContent.includes('updated to') || messageContent.includes('changed to')) {
    return 'Status Changed';
  } else {
    return 'Job Update';
  }
}

getNotificationIcon(message: string): string {
  const messageContent = message.toLowerCase();
  
  if (messageContent.includes('completed')) {
    return 'fas fa-check-circle';
  } else if (messageContent.includes('cancelled')) {
    return 'fas fa-times-circle';
  } else if (messageContent.includes('updated to') || messageContent.includes('changed to')) {
    return 'fas fa-exclamation-triangle';
  } else {
    return 'fas fa-info-circle';
  }
}

getNotificationIconClass(message: string): string {
  const messageContent = message.toLowerCase();
  
  if (messageContent.includes('completed')) {
    return 'success';
  } else if (messageContent.includes('cancelled')) {
    return 'error';
  } else if (messageContent.includes('updated to') || messageContent.includes('changed to')) {
    return 'warning';
  } else {
    return 'info';
  }
}

getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

trackByFn(index: number, item: any): any {
  return item.id || index;
}
}