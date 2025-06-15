import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardDTO, PaginationResult, DashboardStatistics, DashboardFilter } from '../../../core/models/dashboard.models';
import { URL } from '../../../core/Shared/URL';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${URL.apiUrl}/AdminDashboard`;

  constructor(private http: HttpClient) { }

  getDashboardData(
    searchString: string = '',
    pageNumber: number = 1,
    pageSize: number = 5,
    isActive?: boolean,
    filters: DashboardFilter[] = []
  ): Observable<PaginationResult<DashboardDTO>> {
    let params = new HttpParams()
      .set('searchString', searchString)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    filters.forEach(filter => {
      params = params.append('filters', filter);
    });

    return this.http.get<PaginationResult<DashboardDTO>>(`${this.baseUrl}/dashboard-data`, { params });
  }

  getAllStatistics(): Observable<DashboardStatistics> {
    const completedJobs$ = this.http.get<{count: number}>(`${this.baseUrl}`);
    const totalRevenue$ = this.http.get<{totalRevenue: number}>(`${this.baseUrl}/totalrevenue`);
    const averageRating$ = this.http.get<{averageRating: number}>(`${this.baseUrl}/averageRating`);
    const activeClients$ = this.http.get<{count: number}>(`${this.baseUrl}/GetCountOfActiveClient`);

    return forkJoin({
      completedJobs: completedJobs$,
      totalRevenue: totalRevenue$,
      averageRating: averageRating$,
      activeClients: activeClients$
    }).pipe(
      map(results => ({
        completedJobCount: results.completedJobs.count,
        totalRevenue: results.totalRevenue.totalRevenue,
        averageRating: results.averageRating.averageRating,
        activeClientCount: results.activeClients.count
      }))
    );
  }
}