import { Component, OnInit, OnDestroy } from '@angular/core';
import { HandymanService } from '../../services/handyman.service';
import { AdminHandyManDTO, PaginatedResponse } from '../../../../core/models/Adminhandyman.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HandymanDetailsComponent } from '../handyman-details/handyman-details.component';
import { HandymanEditComponent } from '../handyman-edit/handyman-edit.component';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-handyman-list',
  templateUrl: './handyman-list.component.html',
  styleUrls: ['./handyman-list.component.css'],
  imports: [CommonModule, FormsModule, HandymanDetailsComponent, HandymanEditComponent]
})
export class HandymanListComponent implements OnInit, OnDestroy {
  handymen: AdminHandyManDTO[] = [];
  currentPage = 1;
  totalPages = 0;
  totalCount = 0;
  pageSize = 5;
  
  private _searchString = '';
  private _statusFilter = 'all';
  private searchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  loading = false;
  
  // Details modal properties
  selectedHandyman: AdminHandyManDTO | null = null;
  isDetailsModalVisible = false;
  
  // Edit modal properties
  selectedHandymanForEdit: AdminHandyManDTO | null = null;
  isEditModalVisible = false;
  
  // Math object for template
  Math = Math;

  constructor(private handymanService: HandymanService, private toastr: ToastrService) {
    this.searchSubject.pipe(
      distinctUntilChanged(), 
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1;  
      this.loadHandymen();
    });

    // Set up filter subject
    this.filterSubject.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;  
      this.loadHandymen();
    });
  }

  get searchString(): string {
    return this._searchString;
  }

  set searchString(value: string) {
    this._searchString = value;
    this.searchSubject.next(value);
  }

  get statusFilter(): string {
    return this._statusFilter;
  }

  set statusFilter(value: string) {
    this._statusFilter = value;
  }

  ngOnInit(): void {
    this.loadHandymen();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHandymen(): void {
    this.loading = true;
    
    // Convert status filter to boolean or null for API call
    let isActiveFilter: boolean | null = null;
    if (this._statusFilter === 'active') {
      isActiveFilter = true;
    } else if (this._statusFilter === 'inactive') {
      isActiveFilter = false;
    }

    this.handymanService.getAllHandymen(
      this._searchString, 
      this.currentPage, 
      this.pageSize, 
      isActiveFilter
    ).subscribe({
      next: (response: PaginatedResponse<AdminHandyManDTO>) => {
        this.handymen = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading handymen:', error);
        this.loading = false;

      }
    });
  }

  onSearch(): void {
    // called from the template but the actual search is handled by the searchSubject
  }

  onStatusFilterChange(): void {
    this.filterSubject.next();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadHandymen();
    }
  }

  viewDetails(handyman: AdminHandyManDTO): void {
    this.selectedHandyman = handyman;
    this.isDetailsModalVisible = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalVisible = false;
    this.selectedHandyman = null;
  }

  editHandyman(handyman: AdminHandyManDTO): void {
    this.selectedHandymanForEdit = handyman;
    this.isEditModalVisible = true;
  }

  closeEditModal(): void {
    this.isEditModalVisible = false;
    this.selectedHandymanForEdit = null;
  }

  onHandymanUpdated(updatedHandyman: AdminHandyManDTO): void {
    const index = this.handymen.findIndex(h => h.userId === updatedHandyman.userId);
    if (index !== -1) {
      this.handymen[index] = updatedHandyman;
    }
    this.closeEditModal();
  // Reload the list to ensure all data is up-to-date
    this.loadHandymen();
  }

  deleteHandyman(handyman: AdminHandyManDTO): void {
    const confirmMessage = `Are you sure you want to delete ${handyman.firstName} ${handyman.lastName}?`;
    
    if (confirm(confirmMessage)) {
      this.loading = true;
      this.handymanService.deleteHandyman(handyman.userId).subscribe({
        next: () => {
          if (this.handymen.length === 1 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.loadHandymen();
          this.toastr.success('Handyman deleted successfully.', 'Success', {
            timeOut: 3000,
          });
        },
        error: (error) => {
          console.error('Error deleting handyman:', error);
          this.loading = false;
          this.toastr.error('Failed to delete handyman. Please try again.', 'Error', {
            timeOut: 3000,
          });
        }
      });
    }
  }

  refreshList(): void {
    this.loadHandymen();
  }

  resetFilters(): void {
    this._searchString = '';
    this._statusFilter = 'all';
    this.currentPage = 1;
    this.loadHandymen();
  }
}