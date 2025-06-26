import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingViewModel } from '../../../core/models/Booking.model';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
declare var bootstrap: any;


@Component({
  selector: 'app-booking',
  imports: [],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit {
  bookings: BookingViewModel[] = [];

  constructor(private bookingSerivce: BookingService) {}

  ngOnInit(): void {
    this.getAllBookings();
  }

  getAllBookings() {
    this.bookingSerivce.GetAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
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
            handymanName: booking.handymanName,
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
