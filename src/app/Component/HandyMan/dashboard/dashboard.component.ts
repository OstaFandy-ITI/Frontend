import { BookingService } from './../services/booking.service';
import { HandyManService } from '../services/handy-man.service';
import { AuthService } from './../../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { BookingViewModel } from '../../../core/models/Booking.model';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
declare var bootstrap: any;
import * as L from 'leaflet';


@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  HandyId!: number;
  todayJobs!: number;
  completedJobs!: number;
  pendingQuotes!: number;
  bookings:BookingViewModel[]=[];

  router: any;

  constructor(
    private handymanService: HandyManService,
    private authService: AuthService,
    private bookingService:BookingService,
  ) {
    this.authService.CurrentUser$.subscribe((user) => {
      this.HandyId = Number(user?.NameIdentifier);
      console.log(this.HandyId);
    });
  }
  ngOnInit(): void {
    this.getHandyStat();
    this.getAllBookings();
  }

  getHandyStat() {
    this.handymanService.getHandymanStatistics(this.HandyId).subscribe({
      next: (data) => {
        this.todayJobs = data.todayJobs;
        this.completedJobs = data.completedJobs;
        this.pendingQuotes = data.pendingQuotes;
        console.log(data);
        console.log(this.todayJobs, this.completedJobs, this.pendingQuotes);
      },
      error: (err) => {
        console.log(err);   
      },
    });
  }

  getAllBookings() {
    this.bookingService.getHandymanBooking(this.HandyId).subscribe({
      next: (response) => {
        this.bookings = response.data;
        this.initializeCalendar();
      },
      error: (error) => {
        console.error('Error fetching bookings:', error);
      },
    });
  }

  initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: this.bookings.map((booking) => {
        const startDate = booking.preferredDate
          ? new Date(booking.preferredDate + 'Z')
          : undefined;
        const endDate = startDate
          ? new Date(
              startDate.getTime() + (booking.estimatedMinutes ?? 0) * 60000
            )
          : undefined;
      
        return {
          title: `${booking.categoryName} - ${booking.handymanName}`,
          start: startDate,
          end: endDate,
          extendedProps: {
            clientName: booking.clientName,
            categoryName: booking.categoryName,
            serviceNames: booking.serviceNames?.join(', '),
            note: booking.note,
            status: booking.status,
          },
        };
      }),
      eventClick: (info) => {
        const props= info.event.extendedProps;
        const modalBody=document.getElementById('modalBody');
        
        if (modalBody) {
          modalBody.innerHTML = `
            <p><strong>Client Name:</strong> ${props['clientName']}</p>
            <p><strong>Handyman Name:</strong> ${props['handymanName']}</p>
            <p><strong>Category:</strong> ${props['categoryName']}</p>
            <p><strong>Services:</strong> ${props['serviceNames']}</p>
            <p><strong>Note:</strong> ${props['note']}</p>
            <p><strong>Status:</strong> ${props['status']}</p>
          `;
        }
         const modalElement = document.getElementById('eventModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
        
      }
    });


    calendar.render();
    

  }
}
