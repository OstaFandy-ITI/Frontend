import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Application } from './../../../core/models/Application';
import { ApplicationService } from './../services/application.service';
import { ToastrService } from 'ngx-toastr';

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
  paginatedApplications: Application[] = [];
  specialties: string[] = [];

  // UI State
  isLoading = false;
  processingUserId: number | null = null;
  selectedApplication: Application | null = null; 

  // Filters
  searchTerm = '';
  selectedSpecialty = '';
  
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  pageNumber = 1;
  pageSize = 5;
  totalCount = 0;
  totalPages = 0;
  


  constructor(private applicationService: ApplicationService,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getPendingApplications().subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);
        
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
              this.toastr.error('Error', 'No applications data found in server response');
              this.isLoading = false;
              return;
            }
          }
        } else {
          this.toastr.error('Error', 'Invalid response format from server');
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
        this.toastr.error('Error', 'Failed to load applications');
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
    
    this.pageNumber = 1;
    
    if (this.sortField) {
      this.applySorting();
    }
       this.updatePagination();
  }

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
    this.updatePagination();
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

  private updatePagination(): void {
    this.totalCount = this.filteredApplications.length;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    
    if (this.pageNumber > this.totalPages && this.totalPages > 0) {
      this.pageNumber = this.totalPages;
    } else if (this.totalPages === 0) { 
      this.pageNumber = 1;
    }
    
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.paginatedApplications = this.filteredApplications.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.updatePagination();
    }
  }

  get hasPreviousPage(): boolean {
    return this.pageNumber > 1;
  }

  get hasNextPage(): boolean {
    return this.pageNumber < this.totalPages;
  }

  Math = Math;

  openHandymanDetailsModal(application: Application): void {
    this.selectedApplication = application;
   
  }

  closeHandymanDetailsModal(): void {
    const modalElement = document.getElementById('handymanDetailsModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      } else {
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
      }
    }
    this.selectedApplication = null; 
  }

  approveApplication(application: Application): void {
    if (!application.userId) {
      console.error('Application userId is missing');
      return;
    }
    
    console.log('Approving application for user:', application.userId, application.fullName);
    this.processingUserId = application.userId;

    this.applicationService.approveHandyman(application.userId).subscribe({
      next: (response) => {
        console.log('Application approved successfully:', response);
        this.toastr.success('Success', `${application.fullName} has been approved successfully`);
        
        this.removeApplicationFromList(application.userId!);
        this.extractSpecialties(); 
        this.processingUserId = null;
        this.closeHandymanDetailsModal(); 
      },
      error: (error) => {
        console.error('Error approving application:', error);
        this.toastr.success('Error', `Failed to approve ${application.fullName}. Please try again.`);
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
        this.toastr.success('Success', `${application.fullName} has been rejected`);
        
        this.removeApplicationFromList(application.userId!);
        this.extractSpecialties(); 
        this.processingUserId = null;
        this.closeHandymanDetailsModal(); 
      },
      error: (error) => {
        console.error('Error rejecting application:', error);
        this.toastr.success('Error', `Failed to reject ${application.fullName}. Please try again.`);
        this.processingUserId = null;
      }
    });
  }

  private removeApplicationFromList(userId: number): void {
    console.log('Removing application for userId:', userId);
    
    const initialCount = this.applications.length;
    const initialFilteredCount = this.filteredApplications.length;
    
    this.applications = this.applications.filter(app => app.userId !== userId);
    
    this.filteredApplications = this.filteredApplications.filter(app => app.userId !== userId);
    
    console.log(`Applications removed. Before: ${initialCount}, After: ${this.applications.length}`);
    console.log(`Filtered applications removed. Before: ${initialFilteredCount}, After: ${this.filteredApplications.length}`);
    
    this.applyFilters();
  }


  

  trackByUserId(index: number, item: Application): number {
    return item.userId || index;
  }

  get pendingCount(): number {
    return this.applications.length;
  }
  isSortedBy(field: string): boolean {
    return this.sortField === field;
  }
  getSortIcon(field: string): string {
    if (!this.isSortedBy(field)) {
      return 'bi bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }
}