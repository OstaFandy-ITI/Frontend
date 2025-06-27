import { Routes } from "@angular/router";
import { SideNavComponent } from './Layout/side-nav/side-nav.component';

export const handymanRoutes: Routes = [{
        path: '',
        component:SideNavComponent
        , children: [
            
        ]
    
}]