import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { adminRoutes } from './Component/Admin/Admin.routes';
import { handymanRoutes } from './Component/HandyMan/HandyMan.routes';
import { adminGuard } from './core/guards/admin.guard';
import { HandymanRegistrationComponent } from './auth/handyman-registration/handyman-registration.component';
import { BookingWizardComponent } from './Component/Customer/booking-wizard/booking-wizard.component';
import { ChatComponent } from './Component/Customer/chat/chat.component';
import { handymanGuard } from './core/guards/handyman.guard';
import { HomeComponent } from './Component/Customer/home/home.component';
import { clientRoutes } from './Component/Customer/Customer.routes';
import { customerGuard } from './core/guards/customer.guard';
import { AboutUsComponent } from './Component/Customer/about-us/about-us.component';
import { CareersComponent } from './Component/Customer/careers/careers.component';
import { HandymanPendingComponent } from './Component/HandyMan/Layout/handyman-pending/handyman-pending.component';
import { HandymanRejectedComponent } from './Component/HandyMan/Layout/handyman-rejected/handyman-rejected.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registerHamdyMan', component: HandymanRegistrationComponent },
  { path: 'handyman/pending', component: HandymanPendingComponent },
    { path: 'handyman/rejected', component: HandymanRejectedComponent },
    {path:'Unauthorized',component:UnauthorizedComponent},

  {
    path: 'admin',
    canActivate: [adminGuard],
    children: adminRoutes,
  },

  {
    path: 'booking',
    component: BookingWizardComponent,
    canActivate: [customerGuard],
  },

  { path: 'chat', component: ChatComponent },
  { path: 'handyman', canActivate: [handymanGuard], children: handymanRoutes },
  { path: 'about', component: AboutUsComponent },
  { path: 'careers', component: CareersComponent },

  { path: 'client', canActivate: [customerGuard], children: clientRoutes },
];
