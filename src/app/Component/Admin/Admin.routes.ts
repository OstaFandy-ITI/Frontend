import { Routes } from '@angular/router';
import { SideNavComponent} from './Layout/side-nav/side-nav.component';
import { BookingComponent } from './booking/booking.component';

export const adminRoutes: Routes = [
 {
    path: '',
    component: SideNavComponent, 
    children: [
      { path: 'booking', component: BookingComponent },
    ]
  }

]