import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { ClientBookingComponent } from './client-booking/client-booking.component'; // New
import { ClientQuotesComponent } from './client-quotes/client-quotes.component'; // New
import { ClientMessagesComponent } from './client-messages/client-messages.component'; // New

export const clientRoutes: Routes = [
  {
    path: '',
    component: SideNavComponent, // Use SideNavComponent as the main layout for client routes
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Client Home'
      },
      {
        path: 'profile',
        component: ClientProfileComponent,
        title: 'Client Profile'
      },
      {
        path: 'bookings', // Route for My Bookings
        component: ClientBookingComponent,
        title: 'My Bookings'
      },
      {
        path: 'quotes', // Route for Quotes
        component: ClientQuotesComponent,
        title: 'Quotes'
      },
      {
        path: 'messages', // Route for Messages
        component: ClientMessagesComponent,
        title: 'Messages'
      },
    ]
  }
];
