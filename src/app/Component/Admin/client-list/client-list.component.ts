// components/client-list/client-list.component.ts
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
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  
  // Search and filters
  searchControl = new FormControl('');
  statusFilter: boolean | null = null;
  
  // Modal instances
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
        this.clients = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.toastr.error('Failed to load clients', 'Error');
        this.loading = false;
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  openDetailModal(client: AdminDisplayClientDTO): void {
    this.selectedClient = client;
    const modalElement = document.getElementById('clientDetailModal');
    if (modalElement) {
      this.detailModalInstance = new bootstrap.Modal(modalElement);
      this.detailModalInstance.show();
    }
  }

  openEditModal(client: AdminDisplayClientDTO): void {
    this.selectedClient = { ...client };
    const modalElement = document.getElementById('clientEditModal');
    if (modalElement) {
      this.editModalInstance = new bootstrap.Modal(modalElement);
      this.editModalInstance.show();
    }
  }

  onClientUpdated(): void {
    this.editModalInstance?.hide();
    this.loadClients();
    this.toastr.success('Client updated successfully', 'Success');
  }

  confirmDelete(client: AdminDisplayClientDTO): void {
    if (confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      this.deleteClient(client.id);
    }
  }

  private deleteClient(id: number): void {
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.loadClients();
        this.toastr.success('Client deleted successfully', 'Success');
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.toastr.error('Failed to delete client', 'Error');
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
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}