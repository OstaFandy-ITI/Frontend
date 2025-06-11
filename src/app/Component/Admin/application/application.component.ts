import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Application } from './../../../core/models/Application';
import { ApplicationService } from './../services/application.service';

declare var bootstrap: any;

@Component({
  selector: 'app-application',
  imports: [CommonModule, FormsModule],
  templateUrl: './application.component.html',
  styleUrl: './application.component.css'
})
export class ApplicationComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  specialties: string[] = [];

  // UI State
  isLoading = false;
  processingUserId: number | null = null;

  // Filters
  searchTerm = '';
  selectedSpecialty = '';
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Toast properties
  toastTitle = '';
  toastMessage = '';
  toastIcon = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getPendingApplications().subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);
        
        // Handle different response formats
        let applicationsData: any[] = [];
        
        if (Array.isArray(response)) {
          applicationsData = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            applicationsData = response.data;
          } else if (response.applications && Array.isArray(response.applications)) {
            applicationsData = response.applications;
          } else if (response.items && Array.isArray(response.items)) {
            applicationsData = response.items;
          } else {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              applicationsData = response[arrayKeys[0]];
            } else {
              console.error('No array found in response:', response);
              this.showToast('Error', 'No applications data found in server response', 'bi bi-exclamation-triangle text-danger');
              this.isLoading = false;
              return;
            }
          }
        } else {
          console.error('Unexpected response format:', response);
          this.showToast('Error', 'Invalid response format from server', 'bi bi-exclamation-triangle text-danger');
          this.isLoading = false;
          return;
        }

        this.applications = applicationsData.map((app: any) => new Application(
          app.userId,
          app.firstName,
          app.lastName,
          app.email,
          app.phone,
          app.isActive,
          app.createdAt,
          app.updatedAt,
          app.specializationCategory,
          app.latitude,
          app.longitude,
          app.defaultAddressPlace,
          app.nationalId,
          app.nationalIdImg,
          app.img,
          app.experienceYears,
          app.status,
          app.adminBlockDateDTO
        ));
        
        this.extractSpecialties();
        this.applyFilters();
        this.isLoading = false;
        console.log('Applications processed successfully:', this.applications.length, 'items');
      },
      error: (error: any) => {
        console.error('Error loading applications:', error);
        this.showToast('Error', 'Failed to load applications', 'bi bi-exclamation-triangle text-danger');
        this.isLoading = false;
      }
    });
  }

  extractSpecialties(): void {
    const specialtySet = new Set<string>();
    this.applications.forEach(app => {
      if (app.specializationCategory) {
        specialtySet.add(app.specializationCategory);
      }
    });
    this.specialties = Array.from(specialtySet).sort();
  }

  // Renamed for clarity
  applyFilters(): void {
    this.filteredApplications = this.applications.filter(app => {
      const matchesSearch = !this.searchTerm || 
        app.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.phone?.includes(this.searchTerm);
      
      const matchesSpecialty = !this.selectedSpecialty || 
        app.specializationCategory === this.selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });
    
    // Reapply sorting if exists
    if (this.sortField) {
      this.applySorting();
    }
  }

  // Keep the old method name for backward compatibility with template
  filterApplications(): void {
    this.applyFilters();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    this.filteredApplications.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortField) {
        case 'fullName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  approveApplication(application: Application): void {
    if (!application.userId) {
      console.error('Application userId is missing');
      return;
    }
    
    console.log('🔄 Approving application for user:', application.userId, application.fullName);
    this.processingUserId = application.userId;

    this.applicationService.approveHandyman(application.userId).subscribe({
      next: (response) => {
        console.log('✅ Application approved successfully:', response);
        this.showToast('Success', `${application.fullName} has been approved successfully`, 'bi bi-check-circle text-success');
        
        // Remove from both arrays immediately
        this.removeApplicationFromList(application.userId!);
        
        // Update specialties list in case this was the only application with this specialty
        this.extractSpecialties();
        
        this.processingUserId = null;
      },
      error: (error) => {
        console.error('Error approving application:', error);
        this.showToast('Error', `Failed to approve ${application.fullName}. Please try again.`, 'bi bi-exclamation-triangle text-danger');
        this.processingUserId = null;
      }
    });
  }

  rejectApplication(application: Application): void {
    if (!application.userId) {
      console.error('Application userId is missing');
      return;
    }
    
    console.log('Rejecting application for user:', application.userId, application.fullName);
    this.processingUserId = application.userId;

    this.applicationService.rejectHandyman(application.userId).subscribe({
      next: (response) => {
        console.log('Application rejected successfully:', response);
        this.showToast('Success', `${application.fullName} has been rejected`, 'bi bi-x-circle text-warning');
        
        // Remove from both arrays immediately
        this.removeApplicationFromList(application.userId!);
        
        // Update specialties list in case this was the only application with this specialty
        this.extractSpecialties();
        
        this.processingUserId = null;
      },
      error: (error) => {
        console.error('Error rejecting application:', error);
        this.showToast('Error', `Failed to reject ${application.fullName}. Please try again.`, 'bi bi-exclamation-triangle text-danger');
        this.processingUserId = null;
      }
    });
  }

  private removeApplicationFromList(userId: number): void {
    console.log('Removing application for userId:', userId);
    
    const initialCount = this.applications.length;
    const initialFilteredCount = this.filteredApplications.length;
    
    // Remove from main applications array
    this.applications = this.applications.filter(app => app.userId !== userId);
    
    // Remove from filtered applications array
    this.filteredApplications = this.filteredApplications.filter(app => app.userId !== userId);
    
    console.log(`Applications removed. Before: ${initialCount}, After: ${this.applications.length}`);
    console.log(`Filtered applications removed. Before: ${initialFilteredCount}, After: ${this.filteredApplications.length}`);
    
    // Force change detection by triggering filter update
    this.applyFilters();
  }

  /**
   * Enhanced toast method with better error handling
   */
  private showToast(title: string, message: string, icon: string): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastIcon = icon;
    
    setTimeout(() => {
      const toastElement = document.getElementById('actionToast');
      if (toastElement) {
        try {
          const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 4000
          });
          toast.show();
        } catch (error) {
          console.error('Error showing toast:', error);
        }
      }
    }, 0);
  }

  trackByUserId(index: number, item: Application): number {
    return item.userId || index;
  }

  /**
   * Getter for pending applications count
   */
  get pendingCount(): number {
    return this.applications.length;
  }

  /**
   * Check if sorting is active for a field
   */
  isSortedBy(field: string): boolean {
    return this.sortField === field;
  }

  /**
   * Get sort icon for a field
   */
  getSortIcon(field: string): string {
    if (!this.isSortedBy(field)) {
      return 'bi bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }
}