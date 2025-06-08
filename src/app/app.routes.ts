import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import{adminRoutes} from './Component/Admin/Admin.routes';

export const routes: Routes = [

    { path: 'login', component: LoginComponent },
     { 
    path: "Admin",
    loadChildren: () => import('./Component/Admin/Admin.routes').then(m => m.adminRoutes) 
  },
];
