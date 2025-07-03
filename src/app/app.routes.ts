import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { adminRoutes } from './Component/Admin/Admin.routes';
import { handymanRoutes } from './Component/HandyMan/HandyMan.routes';
import { adminGuard } from './core/guards/admin.guard';
import { HandymanRegistrationComponent } from './auth/handyman-registration/handyman-registration.component';
import { BookingWizardComponent } from './Component/Customer/booking-wizard/booking-wizard.component';
import { ChatComponent } from './Component/Customer/chat/chat.component';
import { handymanGuard } from './core/guards/handyman.guard';
import { ChatListComponent } from './Component/HandyMan/chat-list/chat-list.component';



import { Component } from '@angular/core';
import { HomeComponent } from './Component/Customer/home/home.component';

import { ClientProfileComponent } from './Component/Customer/client-profile/client-profile.component';

import { SideNavComponent } from './Component/Customer/Layout/side-nav/side-nav.component';


import { clientRoutes } from './Component/Customer/Customer.routes';
import { customerGuard } from './core/guards/customer.guard';
import { AboutUsComponent } from './Component/Customer/about-us/about-us.component';
import { CareersComponent } from './Component/Customer/careers/careers.component';


export const routes: Routes = [

  {path: '',component:HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'registerHamdyMan', component: HandymanRegistrationComponent },
  {
    path: 'admin', canActivate: [adminGuard], children: adminRoutes },

  { path: 'booking', component: BookingWizardComponent,canActivate:[customerGuard] },

  { path: 'chat', component: ChatComponent },
  { path: 'handyman', canActivate: [handymanGuard],children: handymanRoutes},
  { path: 'about', component: AboutUsComponent },
    { path: 'careers', component: CareersComponent },

  { path: 'client', canActivate: [customerGuard],children: clientRoutes},
  {path: 'side-nav', component: SideNavComponent},


  {path: 'client-profile', component: ClientProfileComponent},



];
