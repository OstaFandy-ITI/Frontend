import { Routes } from "@angular/router";
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatListComponent } from "./chat-list/chat-list.component";
import { ChatComponent } from "../Customer/chat/chat.component";

export const handymanRoutes: Routes = [{
        path: '',
        component:SideNavComponent,
         children: [
             { path: 'dashboard',component:DashboardComponent},
             {path:'chatlist' , component: ChatListComponent},
{ path: 'handyman/chat/:chatId', component: ChatComponent }
        ]
    
}]