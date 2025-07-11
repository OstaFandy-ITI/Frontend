import { Routes } from '@angular/router';
import { SideNavComponent} from './Layout/side-nav/side-nav.component';
import { BookingComponent } from './booking/booking.component';
import { CategoryComponent } from './category/category.component';
import { ServiceComponent } from './ServiceCAT/services.component';
import { PaymentsComponent } from './payments/payments.component';
import { ApplicationComponent } from './application/application.component';
import { OrderFeedbackComponent } from './order-feedback/order-feedback.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientListComponent } from '../Admin/Client/client-list/client-list.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { HandymanListComponent } from './HandyMan/handyman-list/handyman-list.component';
import { HandymanBlockDateComponent } from './handyman-block-date/handyman-block-date.component';



export const adminRoutes: Routes = [
 {
    path: '',
    component: SideNavComponent, 
    children: [
      { path: 'booking', component: BookingComponent },
      { path: 'category', component: CategoryComponent },
      {path:"services", component: ServiceComponent},
      { path: 'payments', component: PaymentsComponent },
      {path: 'application', component: ApplicationComponent },
      {path: 'orderfeedback', component: OrderFeedbackComponent  },
      {path: 'AdminDashboard', component: DashboardComponent},
      {path: 'AdminClient', component: ClientListComponent}, 
      {path: 'analytics', component: AnalyticsComponent},
      {path: 'allhandymen', component: HandymanListComponent},
      {path: 'handymanblockdate', component: HandymanBlockDateComponent}

    ]
  }

]