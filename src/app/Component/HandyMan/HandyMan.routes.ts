import { Routes } from "@angular/router";
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatListComponent } from "./chat-list/chat-list.component";

export const handymanRoutes: Routes = [{
        path: '',
        component:SideNavComponent,
         children: [
           { path: 'dashboard',component:DashboardComponent},
             {path:'chatlist' , component: ChatListComponent},

        ]
    
}]