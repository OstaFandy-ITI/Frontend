import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../services/client.service';
import { AdminDisplayClientDTO, ClientSearchParams } from '../../../core/models/client.models';
import { CommonModule } from '@angular/common';
import { ClientDetailModalComponent } from "../client-detail/client-detail.component";
import { ClientEditModalComponent } from "../client-edit/client-edit.component";

declare var bootstrap: any;

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
  imports: [ReactiveFormsModule, CommonModule, ClientDetailModalComponent, ClientEditModalComponent]
})
export class ClientListComponent implements OnInit {
  @ViewChild('detailModal') detailModal!: TemplateRef<any>;
  @ViewChild('editModal') editModal!: TemplateRef<any>;

  clients: AdminDisplayClientDTO[] = [];
  selectedClient: AdminDisplayClientDTO | null = null;
  loading = false;
  
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  
  searchControl = new FormControl('');
  statusFilter: boolean | null = null;
  
  private detailModalInstance: any;
  private editModalInstance: any;

  constructor(
    private clientService: ClientService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadClients();
      });
  }

  loadClients(): void {
    this.loading = true;
    
    const params: ClientSearchParams = {
      searchString: this.searchControl.value || '',
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      isActive: this.statusFilter
    };

    this.clientService.getAllClients(params).subscribe({
      next: (response) => {
        this.clients = response.data || []; 
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
        
        if (this.clients.length === 0 && this.currentPage > 1 && this.totalCount === 0) {
          this.currentPage = 1;
          this.loadClients();
          return;
        }
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.toastr.error('Failed to load clients', 'Error');
        this.loading = false;
        this.clients = [];  
        this.totalCount = 0;
        this.totalPages = 1;
        this.currentPage = 1;
      }
    });
  }

  onStatusFilterChange(status: string): void {
    switch (status) {
      case 'active':
        this.statusFilter = true;
        break;
      case 'inactive':
        this.statusFilter = false;
        break;
      default:
        this.statusFilter = null;
    }
    this.currentPage = 1;
    this.loadClients();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  openDetailModal(client: AdminDisplayClientDTO): void {
    this.selectedClient = client;
    const modalElement = document.getElementById('clientDetailModal');
    if (modalElement) {
      if (this.detailModalInstance) {
        this.detailModalInstance.dispose();
      }
      this.detailModalInstance = new bootstrap.Modal(modalElement);
      this.detailModalInstance.show();
    }
  }

  openEditModal(client: AdminDisplayClientDTO): void {
    this.selectedClient = { ...client }; 
    const modalElement = document.getElementById('clientEditModal');
    if (modalElement) {
      if (this.editModalInstance) {
        this.editModalInstance.dispose();
      }
      this.editModalInstance = new bootstrap.Modal(modalElement);
      this.editModalInstance.show();
    }
  }

  onClientUpdated(): void {
    if (this.editModalInstance) {
      this.editModalInstance.hide();
    }
    this.loadClients();
    this.toastr.success('Client updated successfully', 'Success');
  }

  // confirmDelete(client: AdminDisplayClientDTO): void {
  //   if (confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
  //     this.deleteClient(client.id);
  //   }
  // }
private deleteModalInstance: any;

confirmDelete(client: AdminDisplayClientDTO): void {
  this.selectedClient = client;

  const modalElement = document.getElementById('deleteConfirmModal');
  if (modalElement) {
    if (this.deleteModalInstance) this.deleteModalInstance.dispose();
    this.deleteModalInstance = new bootstrap.Modal(modalElement);
    this.deleteModalInstance.show();
  }
}

proceedDelete(): void {
  if (!this.selectedClient) return;

  this.deleteClient(this.selectedClient.id);

  if (this.deleteModalInstance) {
    this.deleteModalInstance.hide();
  }
}
  private deleteClient(id: number): void {
    this.loading = true;  
    
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        const remainingClientsOnCurrentPage = this.clients.length - 1;
        if (remainingClientsOnCurrentPage === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
        }
        
        this.loadClients();
        this.toastr.success('Client deleted successfully', 'Success');
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.toastr.error('Failed to delete client', 'Error');
        this.loading = false; // Stop loading on error
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      const end = Math.min(this.totalPages, start + maxPagesToShow - 1);
      const adjustedStart = Math.max(1, end - maxPagesToShow + 1);
      
      for (let i = adjustedStart; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  resetFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter = null;
    this.currentPage = 1;
    
    const statusSelect = document.querySelector('select') as HTMLSelectElement;
    if (statusSelect) {
      statusSelect.value = '';
    }
    
    this.loadClients();
  }

  get showingText(): string {
    if (this.totalCount === 0) {
      return 'Showing 0 to 0 of 0 entries';
    }
    
    const start = ((this.currentPage - 1) * this.pageSize) + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);
    
    return `Showing ${start} to ${end} of ${this.totalCount} entries`;
  }

  // Cleanup method
  ngOnDestroy(): void {
    if (this.detailModalInstance) {
      this.detailModalInstance.dispose();
    }
    if (this.editModalInstance) {
      this.editModalInstance.dispose();
    }
  }
}