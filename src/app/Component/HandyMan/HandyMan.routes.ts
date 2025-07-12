import { Routes } from '@angular/router';
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AllJobsComponent } from './alljobs/alljobs.component';
import { QuotesComponent } from './quotes/quotes.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { HandymanBlockDateComponent } from './handyman-block-date/handyman-block-date.component';
import { HandymanProfileComponent } from './handyman-profile/handyman-profile.component';

export const handymanRoutes: Routes = [
  {
    path: '',
    component: SideNavComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'alljobs', component: AllJobsComponent },
      { path: 'quotes', component: QuotesComponent },
      {path: 'profile', component: HandymanProfileComponent },
      { path: 'chatlist', component: ChatListComponent },
      { path: 'blockdate', component: HandymanBlockDateComponent },
      {
        path: 'chat/:chatId',
        loadComponent: () =>
          import('../Customer/chat/chat.component').then(
            (m) => m.ChatComponent
          ),
      },
    ],
  },
];
