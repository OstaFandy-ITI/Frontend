import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from './../services/notification.service';
import { Notification, CreateBookingDTO, QuoteResponseDTO } from '../../../core/models/notification.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class NotificationComponent implements OnInit {
    notifications: Notification[] = [];
    unreadCount = 0;
    isDropdownOpen = false;
    loading = false;
    userId: number;
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

    constructor(private notificationService: NotificationService, private authService: AuthService, private toastr: ToastrService) {
        // this.minDate = new Date().toISOString().slice(0, 16);
        this.userId = this.authService.getCurrentUserId() ?? 0;
        // this.selectedDate = new Date().toISOString().slice(0, 10);
        
    }

ngOnInit() {
    this.loadNotifications();
    
    const userId = this.authService.getCurrentUserId() ?? 0;  
    this.notificationService.startConnection(userId);
    
    // this.notificationService.onQuoteUpdate((message: string) => {
    //     console.log('Quote notification received:', message);
    //     this.toastr.info(message, 'Quote Updated');
    //     this.loadNotifications();
    // });

    this.notificationService.onJobUpdate((jobId: number, status: string) => {
        console.log('Job status update received:', jobId, status);
        this.toastr.info(`Job ${jobId} status changed to ${status}`, 'Job Status Updated');
        this.loadNotifications();
    });

    // this.notificationService.onQuoteResponse((quoteId: number, action: string) => {
    //     console.log('Quote response received:', quoteId, action);
    //     this.toastr.info(`Quote ${quoteId} has been ${action}`, 'Quote Response');
    //     this.loadNotifications();
    // });
}



    loadNotifications() {
        this.loading = true;
        console.log('Loading notifications for userId:', this.userId);
        this.notificationService.getNotifications(this.userId).subscribe({
            next: (notifications) => {
                console.log('Raw API Response:', notifications);
                this.notifications = notifications;
                this.unreadCount = notifications.filter(n => !n.isRead).length;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.loading = false;
            }
        });
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    approve(notification: Notification) {
        // if (notification.type === 'QuoteApproval') {
        //     this.handleQuoteApproval(notification);
        // } else if (notification.type === 'QuoteStatusChange') { 
        //     this.handleQuoteStatusApproval(notification);
        // } else {
            this.handleJobStatusApproval(notification);
        // }
    }

    dismiss(notification: Notification) {
        // if (notification.type === 'QuoteApproval') {
        //     this.handleQuoteRejection(notification);
        // } else if (notification.type === 'QuoteStatusChange') {
        //     this.handleQuoteStatusDismissal(notification);
        // } else {
            this.handleJobStatusDismissal(notification);
        // }
    }

// private handleQuoteApproval(notification: Notification) {
//     console.log('Handling quote approval for notification:', notification);
//     console.log('Related Entity ID:', notification.relatedEntityId);
    
//     if (!notification.relatedEntityId) {
//         console.error('No quote ID found in notification');
//         return;
//     }

//     this.processingQuote = true;
//     this.notificationService.getQuoteByJobId(notification.relatedEntityId).subscribe({
//         next: (quoteDetails) => {
//             console.log('Quote details loaded:', quoteDetails);
//             this.selectedQuote = quoteDetails;
//             this.showDatePicker = true;
//             this.processingQuote = false;
//         },
//         error: (error) => {
//             console.error('Error loading quote details:', error);
//             this.processingQuote = false;
//             alert('Error loading quote details. Please try again.');
//         }
//     });
// }

// onDateSelected() {
//     if (!this.selectedQuote || !this.selectedDate) {
//         return;
//     }
//     const dateToCheck = new Date(this.selectedDate);
//         if (isNaN(dateToCheck.getTime())) {
//         alert('Please select a valid date.');
//         return;
//     }

//     this.loadingTimeSlots = true;
    
//     this.notificationService.getAvailableTimeSlots(
//         this.selectedQuote.handymanId, 
//         dateToCheck, 
//         this.selectedQuote.estimatedMinutes
//     ).subscribe({
//         next: (timeSlots) => {
//             console.log('Available time slots:', timeSlots);
            
//             if (!timeSlots || timeSlots.length === 0) {
//                 alert('No available time slots found for this date. Please select another date.');
//                 this.loadingTimeSlots = false;
//                 return;
//             }
            
//             this.availableTimeSlots = timeSlots;
//             this.showDatePicker = false;
//             this.showTimeSlots = true;
//             this.loadingTimeSlots = false;
//         },
//         error: (error) => {
//             console.error('Error loading time slots:', error);
//             this.loadingTimeSlots = false;
//             alert('No available time slots found for this date. Please select another date.');
//         }
//     });
// }


// confirmQuoteAcceptance() {
//     if (!this.selectedQuote || !this.selectedDate || !this.selectedTime) {
//         alert('Please select both date and time slot.');
//         return;
//     }

//     console.log('=== DEBUGGING QUOTE ACCEPTANCE ===');
//     console.log('Selected Quote Data:', JSON.stringify(this.selectedQuote, null, 2));
//     console.log('Selected Date:', this.selectedDate);
//     console.log('Selected Time:', this.selectedTime);
//     console.log('User ID:', this.userId);

//     let finalDateTime: Date;
    
//     if (this.selectedTime.includes('T')) {
//         finalDateTime = new Date(this.selectedTime);
//     } else {
//         const [hours, minutes] = this.selectedTime.split(':').map(Number);
//         finalDateTime = new Date(this.selectedDate);
//         finalDateTime.setHours(hours, minutes, 0, 0);
//     }

//     if (isNaN(finalDateTime.getTime())) {
//         console.error('Invalid date created:', finalDateTime);
//         alert('Invalid date/time selected. Please try again.');
//         return;
//     }

//     console.log('Final DateTime:', finalDateTime.toISOString());

//     // Extract values with proper fallbacks
//     const quoteId = this.selectedQuote.quoteId;
//     const clientId = this.selectedQuote.clientId;
//     const addressId = this.selectedQuote.addressId;
//     const handymanId = this.selectedQuote.handymanId;
//     const estimatedMinutes = this.selectedQuote.estimatedMinutes || 60;
//     const totalPrice = this.selectedQuote.price || 0;

//     console.log('=== EXTRACTED VALUES ===');
//     console.log('Quote ID:', quoteId);
//     console.log('Client ID:', clientId);
//     console.log('Address ID:', addressId);
//     console.log('Handyman ID:', handymanId);
//     console.log('Estimated Minutes:', estimatedMinutes);
//     console.log('Total Price:', totalPrice);

//     // Validate required fields
//     if (!quoteId || !handymanId || !addressId || !clientId) {
//         console.error('Missing required fields');
//         alert('Error: Missing required data. Cannot process acceptance.');
//         return;
//     }

//     //Handle empty services array
//     let serviceDto: any[];
    
//     if (this.selectedQuote.originalServices && this.selectedQuote.originalServices.length > 0) {
//         serviceDto = this.selectedQuote.originalServices;
//     } else {
//         serviceDto = [{ 
//             serviceId: 2,
//             quantity: 1,
//             price: totalPrice
//         }];
        
//         console.log('Created default service DTO since originalServices is empty:', serviceDto);
//     }

//     // Create booking data
//     const bookingData: CreateBookingDTO = {
//         clientId: clientId,
//         addressId: addressId,
//         preferredDate: finalDateTime,
//         estimatedMinutes: estimatedMinutes,
//         totalPrice: totalPrice,
//         note: this.selectedQuote.notes || `Booking created from quote acceptance on ${new Date().toISOString()}`,
//         serviceDto: serviceDto,
//         handymanId: handymanId,
//         amount: totalPrice,
//         method: 'Stripe',
//         paymentStatus: 'Pending',
//         receiptUrl: ''
//     };

//     const quoteResponse: QuoteResponseDTO = {
//         quoteId: quoteId,
//         action: 'accept',
//         clientUserId: this.userId,
//         bookingData: bookingData
//     };

//     console.log('=== FINAL PAYLOAD ===');
//     console.log('Quote Response:', JSON.stringify(quoteResponse, null, 2));

//     this.processingQuote = true;
//     this.notificationService.processQuoteResponse(quoteResponse).subscribe({
//         next: (response) => {
//             console.log('Quote acceptance response:', response);
//             // Update the notification
//             const notification = this.notifications.find(n => 
//                 n.relatedEntityId === quoteId && 
//                 n.type === 'QuoteApproval'
//             );
//             if (notification) {
//                 notification.isRead = true;
//                 notification.actionTaken = 'accept';
//             }
            
//             this.unreadCount = this.notifications.filter(n => !n.isRead).length;
//             this.closeAllModals();
//             this.processingQuote = false;
//             alert('Quote accepted and booking created successfully!');
//         },
//         error: (error) => {
//             console.error('=== ERROR DETAILS ===');
//             console.error('Status:', error.status);
//             console.error('Status Text:', error.statusText);
//             console.error('Error Object:', error.error);
            
//             if (error.error && error.error.errors) {
//                 console.error('Validation Errors:', error.error.errors);
                
//                 // Display specific validation errors
//                 const errorMessages = [];
//                 for (const field in error.error.errors) {
//                     const fieldErrors = error.error.errors[field];
//                     errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
//                 }
                
//                 alert(`Validation Errors:\n${errorMessages.join('\n')}`);
//             } else {
//                 const errorMessage = error.error?.message || error.error?.title || error.message || 'Unknown error';
//                 alert(`Error accepting quote: ${errorMessage}`);
//             }
            
//             this.processingQuote = false;
//         }
//     });
// }



// onTimeSelected(timeSlot: any) {
//     console.log('Time slot selected:', timeSlot);
    
//     // Handle different time slot formats
//     if (typeof timeSlot === 'string') {
//         this.selectedTime = timeSlot;
//     } else if (timeSlot.time) {
//         this.selectedTime = timeSlot.time;
//     } else if (timeSlot.startTime) {
//         this.selectedTime = timeSlot.startTime;
//     } else if (timeSlot.value) {
//         this.selectedTime = timeSlot.value;
//     } else {
//         this.selectedTime = timeSlot.toString();
//     }
    
//     console.log('Selected time set to:', this.selectedTime);
    
//     // Extract just the time part if it's a full datetime string
//     if (this.selectedTime.includes('T')) {
//         const timePart = this.selectedTime.split('T')[1];
//         if (timePart) {
//             this.selectedTime = timePart.substring(0, 5);
//         }
//     }
    
//     console.log('Final selected time:', this.selectedTime);
// }


//     private handleQuoteRejection(notification: Notification) {
//         console.log('Starting quote rejection process');
        
//         if (!notification.relatedEntityId) {
//             console.error('No quote ID found in notification');
//             return;
//         }

//         const dummyBookingData: CreateBookingDTO = {
//             clientId: this.userId,
//             addressId: 1,
//             preferredDate: new Date(),
//             estimatedMinutes: 0,
//             totalPrice: 0,
//             note: 'Quote rejection - no booking needed',
//             serviceDto: [{ serviceId: 2, quantity: 1 }],
//             handymanId: 1,
//             amount: 0,
//             method: 'Stripe',
//             paymentStatus: 'Cancelled',
//             receiptUrl: ''
//         };

//         const quoteResponse: QuoteResponseDTO = {
//             quoteId: notification.relatedEntityId,
//             action: 'reject',
//             clientUserId: this.userId,
//             bookingData: dummyBookingData
//         };

//         this.processingQuote = true;
        
//         this.notificationService.processQuoteResponse(quoteResponse).subscribe({
//             next: (response) => {
//                 notification.isRead = true;
//                 notification.actionTaken = 'reject';
//                 this.unreadCount = this.notifications.filter(n => !n.isRead).length;
//                 this.processingQuote = false;
//                 console.log('Quote rejected successfully');
//             },
//             error: (error) => {
//                 console.error('Error rejecting quote:', error);
//                 this.processingQuote = false;
//                 alert('Error rejecting quote. Please try again.');
//             }
//         });
//     }

//     // Modal management
//     closeAllModals() {
//         this.showDatePicker = false;
//         this.showTimeSlots = false;
//         this.selectedQuote = null;
//         this.selectedDate = "";
//         this.selectedTime = '';
//         this.availableTimeSlots = [];
//     }

//     goBackToDatePicker() {
//         this.showTimeSlots = false;
//         this.showDatePicker = true;
//         this.selectedTime = '';
//         this.availableTimeSlots = [];
//     }

//     private handleQuoteStatusApproval(notification: Notification) {
//         const jobId = parseInt(notification.type.split(',')[0]) || 0;
//         const requestedStatus = notification.type.split(',')[1];
        
//         this.notificationService.approveQuoteStatus(jobId, requestedStatus, this.userId).subscribe({
//             next: (response) => {
//                 notification.isRead = true;
//                 notification.actionTaken = 'approved';
//                 notification.currentJobStatus = requestedStatus;
//                 this.unreadCount = this.notifications.filter(n => !n.isRead).length;
//                 console.log('Quote status approved successfully');
//             },
//             error: (error) => {
//                 console.error('Error approving quote status:', error);
//             }
//         });
//     }

//     private handleQuoteStatusDismissal(notification: Notification) {
//         this.notificationService.markNotificationAsRead(notification.id).subscribe({
//             next: (response) => {
//                 notification.isRead = true;
//                 notification.actionTaken = 'dismissed';
//                 this.unreadCount = this.notifications.filter(n => !n.isRead).length;
//             },
//             error: (error) => {
//                 console.error('Error dismissing quote status notification:', error);
//             }
//         });
//     }

    private handleJobStatusApproval(notification: Notification) {
        const jobId = parseInt(notification.type.split(',')[0]) || 0;
        const requestedStatus = notification.type.split(',')[1];
        
        this.notificationService.approveJobStatus(jobId, requestedStatus, this.userId).subscribe({
            next: (response) => {
                console.log('Job status approved successfully');
                notification.isRead = true;
                notification.actionTaken = 'approved';
                notification.currentJobStatus = requestedStatus;
                this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            },
            error: (error) => {
                console.error('Error approving job status:', error);
            }
        });
    }

    private handleJobStatusDismissal(notification: Notification) {
        this.notificationService.markNotificationAsRead(notification.id).subscribe({
            next: (response) => {
                notification.isRead = true;
                notification.actionTaken = 'dismissed';
                this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            },
            error: (error) => {
                console.error('Error dismissing notification:', error);
            }
        });
    }

    // Helpers
    getRequestedStatus(notification: Notification): string {
        const parts = notification.type.split(',');
        return parts.length > 1 ? parts[1] : '';
    }

    isQuoteNotification(notification: Notification): boolean {
        return notification.type === 'QuoteApproval';
    }

    isQuoteStatusNotification(notification: Notification): boolean {
        return notification.type === 'QuoteStatusChange' || notification.type.includes('QuoteStatusChange');
    }

    getActionButtonText(notification: Notification): { approve: string, dismiss: string } {
        if (this.isQuoteNotification(notification)) {
            return { approve: 'Accept Quote', dismiss: 'Reject Quote' };
        } else if (this.isQuoteStatusNotification(notification)) {
            return { approve: 'Approve Quote Status', dismiss: 'Dismiss' };
        } else {
            return { approve: 'Approve', dismiss: 'Dismiss' };
        }
    }
}
