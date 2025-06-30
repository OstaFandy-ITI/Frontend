import { Routes } from "@angular/router";
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AllJobsComponent } from './alljobs/alljobs.component';
import { ChatListComponent } from "./chat-list/chat-list.component";

export const handymanRoutes: Routes = [{
        path: '',
        component:SideNavComponent,
         children: [
           { path: 'dashboard',component:DashboardComponent},
           { path: 'alljobs',component:AllJobsComponent},
           {path:'chatlist' , component: ChatListComponent},

        ]
    
}]