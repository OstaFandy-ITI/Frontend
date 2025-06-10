import { Routes } from '@angular/router';
import { SideNavComponent} from './Layout/side-nav/side-nav.component';
import { BookingComponent } from './booking/booking.component';
import { CategoryComponent } from './category/category.component';
import { ServicesComponent } from './ServiceCAT/services.component';

export const adminRoutes: Routes = [
 {
    path: '',
    component: SideNavComponent, 
    children: [
      { path: 'booking', component: BookingComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'services', component: ServicesComponent },
    ]
  }

]