import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import{adminRoutes} from './Component/Admin/Admin.routes';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
     {
    path: 'admin',
    canActivate: [adminGuard],
    children: adminRoutes
  },
];
