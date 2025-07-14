import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { DashboardDTO, PaginationResult, DashboardStatistics, DashboardFilter, FilterOption } from '../../../core/models/dashboard.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [FormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  // Data properties
  dashboardData: DashboardDTO[] = [];
  statistics: DashboardStatistics = {
    completedJobCount: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeClientCount: 0
  };

  // Pagination properties
  currentPage = 1;
  totalPages = 0;
  totalCount = 0;
  pageSize = 5;

  // Filter and search properties
  searchString = '';
  selectedFilters: DashboardFilter[] = [];
  isActive?: boolean;
  isDropdownOpen = false;

  // Loading state
  isLoading = false;
  isStatisticsLoading = false;

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  // Filter options
  filterOptions: FilterOption[] = [
    { value: DashboardFilter.Today, label: 'Today' },
    { value: DashboardFilter.ThisWeek, label: 'This Week' },
    { value: DashboardFilter.ThisMonth, label: 'This Month' },
    { value: DashboardFilter.RevenueGreaterThan1000, label: 'Revenue > $1000' },
    { value: DashboardFilter.JobsGreaterThan10, label: 'Jobs > 10' },
    { value: DashboardFilter.RatingGreaterThan4, label: 'Rating > 4' },
    { value: DashboardFilter.PendingApproval, label: 'Pending Approval' }
  ];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadDashboardData();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), 
        distinctUntilChanged() 
      )
      .subscribe(searchTerm => {
        this.searchString = searchTerm;
        this.currentPage = 1;
        this.loadDashboardData();
      });
  }

  loadStatistics(): void {
    this.isStatisticsLoading = true;
    this.dashboardService.getAllStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.isStatisticsLoading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.isStatisticsLoading = false;
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData(
      this.searchString,
      this.currentPage,
      this.pageSize,
      this.isActive,
      this.selectedFilters
    ).subscribe({
      next: (result: PaginationResult<DashboardDTO>) => {
        this.dashboardData = result.data;
        this.currentPage = result.currentPage;
        this.totalPages = result.totalPages;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchString);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDashboardData();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDashboardData();
    }
  }

  toggleFilter(filter: DashboardFilter): void {
    const index = this.selectedFilters.indexOf(filter);
    if (index > -1) {
      this.selectedFilters.splice(index, 1);
    } else {
      this.selectedFilters.push(filter);
    }
    this.currentPage = 1;
    this.loadDashboardData();
  }

  isFilterSelected(filter: DashboardFilter): boolean {
    return this.selectedFilters.includes(filter);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getSelectedFiltersText(): string {
    if (this.selectedFilters.length === 0) {
      return 'Choose Filter';
    }
    if (this.selectedFilters.length === 1) {
      const filter = this.filterOptions.find(f => f.value === this.selectedFilters[0]);
      return filter?.label || 'Choose Filter';
    }
    return `${this.selectedFilters.length} filters selected`;
  }

  clearFilters(): void {
    this.selectedFilters = [];
    this.searchString = '';
    this.isActive = undefined;
    this.currentPage = 1;
    this.loadDashboardData();
  }

  getPaginationNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}