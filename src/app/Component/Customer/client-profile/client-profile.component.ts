import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import { ClientProfile } from '../../../../app/core/models/ClientProfile.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Component({
  selector: 'app-client-profile',
  standalone: true, // Mark as standalone
  imports: [CommonModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {

  user: ClientProfile = {
    id: 0,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    status: 'inactive', // Default status
    createdAt: new Date(),
    updatedAt: new Date(),
    profileImageUrl: 'https://i.pravatar.cc/128?img=5' // Default image
  };

  // Placeholder for client ID - REPLACE WITH ACTUAL LOGIC TO GET AUTHENTICATED USER ID
  // This could come from an authentication service, local storage, or route params.
  clientId: number = 62; // Example ID from your screenshot

  constructor(private clientProfileService: ClientProfileService) { }

  ngOnInit(): void {
    this.loadClientProfile();
  }

  /**
   * Loads the client profile data from the ClientProfileService.
   */
  loadClientProfile(): void {
    if (this.clientId) {
      this.clientProfileService.getClientProfile(this.clientId).subscribe({
        next: (response: ApiResponse<ClientProfile>) => {
          if (response.success && response.data) {
            this.user = {
              ...response.data,
              profileImageUrl: response.data.profileImageUrl || 'https://i.pravatar.cc/128?img=5' // Fallback image
            };
            console.log('Client Profile Loaded:', this.user);
          } else {
            console.error('Failed to load client profile:', response.message);
            // Optionally, show an error message to the user
          }
        },
        error: (error) => {
          console.error('Error fetching client profile:', error);
          // Optionally, show an error message to the user
        }
      });
    } else {
      console.warn('Client ID not available. Cannot load profile.');
      // Handle scenario where client ID is not available (e.g., user not logged in)
    }
  }

  /**
   * Formats a Date object into a readable string (e.g., "July 3, 2024").
   * @param date The Date object to format.
   * @returns Formatted date string.
   */
  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Formats a Date object into a readable string including time (e.g., "July 3, 2024, 2:30 PM").
   * @param date The Date object to format.
   * @returns Formatted date and time string.
   */
  formatDateTime(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}
