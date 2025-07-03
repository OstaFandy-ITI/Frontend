
import { Routes } from '@angular/router';

import { NavbarComponent } from './Layout/navbar/navbar.component';
import { HomeComponent } from './home/home.component';



export const clientRoutes: Routes = [
 {
    path: '',
    component: NavbarComponent, 
    children: [
      { path: 'home', component: HomeComponent },
    ]
  }

]