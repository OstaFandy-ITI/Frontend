import { Routes } from '@angular/router';
import { SideNavComponent} from './Layout/side-nav/side-nav.component';
import { BookingComponent } from './booking/booking.component';
import { CategoryComponent } from './category/category.component';
import { ServiceComponent } from './ServiceCAT/services.component';
import { PaymentsComponent } from './payments/payments.component';
import { ApplicationComponent } from './application/application.component';


export const adminRoutes: Routes = [
 {
    path: '',
    component: SideNavComponent, 
    children: [
      { path: 'booking', component: BookingComponent },
      { path: 'category', component: CategoryComponent },
      {path:"services", component: ServiceComponent},
      { path: 'payments', component: PaymentsComponent },
      {path: 'application', component: ApplicationComponent }
    ]
  }

]