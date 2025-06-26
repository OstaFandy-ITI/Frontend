import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../Admin/services/analytics.service';
import {
  ServiceUsageStat,
  BookingLocationStatsResponse,
  CityBookingStat
} from '../../../core/models/Analytics';
import { HttpErrorResponse } from '@angular/common/http';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  serviceUsageStats: ServiceUsageStat[] = [];
  serviceStatsCount: number | undefined;
  serviceStatsMessage: string | undefined;
  serviceStatsError: string | undefined;

  // Chart data for Service Usage
  public serviceUsageChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  public serviceUsageChartLabels: string[] = [];
  public serviceUsageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Service Usage Counts',
        color: '#004e98' 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' times';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#c0c0c0' 
        },
        ticks: {
          color: '#333'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#c0c0c0' 
        },
        ticks: {
          color: '#333'
        }
      }
    }
  };
  public serviceUsageChartType: ChartType = 'bar';

  
  bookingLocationStats: CityBookingStat[] = [];
  bookingStatsTotalBookings: number | undefined;
  bookingStatsMessage: string | undefined;
  bookingStatsError: string | undefined;

 
  public bookingCityChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  public bookingCityChartLabels: string[] = [];
  public bookingCityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#333'
        }
      },
      title: {
        display: true,
        text: 'Bookings by City Distribution',
        color: '#004e98' 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + ' bookings';
            }
            return label;
          }
        }
      }
    }
  };
  public bookingCityChartType: ChartType = 'doughnut';

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.loadServiceUsageStats();
    this.loadBookingLocationStats();
  }

  private loadServiceUsageStats(): void {
    this.analyticsService.getServiceUsageStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.serviceUsageStats = response.data;
          this.serviceStatsCount = response.count;
          this.serviceStatsMessage = response.message;
          this.prepareServiceUsageChartData();
          console.log('Service Usage Stats:', this.serviceUsageStats);
        } else {
          this.serviceStatsError = response.message || 'Failed to load service usage statistics.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.serviceStatsError = `Error loading service stats: ${err.message}`;
        console.error('Error fetching service usage stats:', err);
      }
    });
  }

  private prepareServiceUsageChartData(): void {
    const labels = this.serviceUsageStats.map(stat => stat.serviceName);
    const data = this.serviceUsageStats.map(stat => stat.usageCount);

    this.serviceUsageChartLabels = labels;
    this.serviceUsageChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Usage Count',
          backgroundColor: [
            '#004e98', '#3a6ea5', '#ffa94d', 
            '#004e98', '#3a6ea5', '#ffa94d',
            '#004e98', '#3a6ea5', '#ffa94d'
          ],
          borderColor: '#ffffff', 
          borderWidth: 1
        }
      ]
    };
  }

  private loadBookingLocationStats(): void {
    this.analyticsService.getBookingLocationStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.bookingLocationStats = response.data;
          this.bookingStatsTotalBookings = response.totalBookings;
          this.bookingStatsMessage = response.message;
          this.prepareBookingCityChartData();
          console.log('Booking Location Stats:', this.bookingLocationStats);
        } else {
          this.bookingStatsError = response.message || 'Failed to load booking location statistics.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.bookingStatsError = `Error loading booking stats: ${err.message}`;
        console.error('Error fetching booking location stats:', err);
      }
    });
  }

  private prepareBookingCityChartData(): void {
    const labels = this.bookingLocationStats.map(stat => stat.city);
    const data = this.bookingLocationStats.map(stat => stat.bookingCount);

    this.bookingCityChartLabels = labels;
    this.bookingCityChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#004e98', 
            '#ffa94d', 
            '#3a6ea5', 
            '#c0c0c0', 
            
            '#004e98', '#3a6ea5', '#ffa94d', '#c0c0c0'
          ],
          borderColor: '#ffffff', 
          borderWidth: 2
        }
      ]
    };
  }

  
  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }
}