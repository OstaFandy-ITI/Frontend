import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { ClientBookingComponent } from './client-booking/client-booking.component';
import { ClientQuotesComponent } from './client-quotes/client-quotes.component';
import { ClientMessagesComponent } from './client-messages/client-messages.component';

export const clientRoutes: Routes = [
  {
    path: '',
    component: SideNavComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile', 
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Client Home'
      },
      {
        path: 'profile/:id', // Keep the parameterized route for direct access
        component: ClientProfileComponent,
        title: 'Client Profile'
      },
      {
        path: 'profile', // Add a route for profile without ID
        component: ClientProfileComponent,
        title: 'Client Profile'
      },
      {
        path: 'bookings',
        component: ClientBookingComponent,
        title: 'My Bookings'
      },
      {
        path: 'quotes',
        component: ClientQuotesComponent,
        title: 'Quotes'
      },
      {
        path: 'messages',
        component: ClientMessagesComponent,
        title: 'Messages'
      },
    ]
  }
];