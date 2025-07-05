import { Routes } from '@angular/router';
import { SideNavComponent } from './Layout/side-nav/side-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AllJobsComponent } from './alljobs/alljobs.component';
import { QuotesComponent } from './quotes/quotes.component';
import { ChatListComponent } from './chat-list/chat-list.component';

export const handymanRoutes: Routes = [
  {
    path: '',
    component: SideNavComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'alljobs', component: AllJobsComponent },
      { path: 'quotes', component: QuotesComponent },
      { path: 'chatlist', component: ChatListComponent },
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
