import { Routes } from '@angular/router';
import { SideNavComponent } from '../HandyMan/Layout/side-nav/side-nav.component';
export const handymanRoutes: Routes = [
  {
    path: '',
    component: SideNavComponent,
    // children: [
    //       { path: '', component:  },
    //     ] 
  }
]