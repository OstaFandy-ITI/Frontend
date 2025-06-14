export interface DashboardDTO {
  service: string;
  location: string;
  client: string;
  handyman: string;
  review: string;
  revenue: number;
}

export interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface DashboardStatistics {
  completedJobCount: number;
  totalRevenue: number;
  averageRating: number;
  activeClientCount: number;
}

export enum DashboardFilter {
  Today = 'Today',
  ThisWeek = 'ThisWeek',
  ThisMonth = 'ThisMonth',
  RevenueGreaterThan1000 = 'RevenueGreaterThan1000',
  JobsGreaterThan10 = 'JobsGreaterThan10',
  RatingGreaterThan4 = 'RatingGreaterThan4',
  PendingApproval = 'PendingApproval'
}

export interface FilterOption {
  value: DashboardFilter;
  label: string;
}