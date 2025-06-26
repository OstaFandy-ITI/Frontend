import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import{adminRoutes} from './Component/Admin/Admin.routes';
import { adminGuard } from './core/guards/admin.guard';
import { HandymanRegistrationComponent } from './auth/handyman-registration/handyman-registration.component';
import { handymanGuard } from './core/guards/handyman.guard';
import { handymanRoutes } from './Component/HandyMan/HandyMan.routes';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
    {path:'registerHamdyMan', component:HandymanRegistrationComponent },
     {
    path: 'admin',
    canActivate: [adminGuard],
    children: adminRoutes
  },
  {
    path: 'handyman',
    canActivate: [handymanGuard],
    children: handymanRoutes
  },
];
