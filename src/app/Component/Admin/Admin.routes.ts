import { Routes } from '@angular/router';
import { SideNavComponent} from './Layout/side-nav/side-nav.component';
import { BookingComponent } from './booking/booking.component';
import { ApplicationComponent } from './application/application.component';

export const adminRoutes: Routes = [
 {
    path: '',
    component: SideNavComponent, 
    children: [
      { path: 'booking', component: BookingComponent },
      {path: 'application', component: ApplicationComponent },
    ]
  }

]