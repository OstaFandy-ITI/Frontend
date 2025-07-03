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

import { customerRoutes } from './Component/Customer/Customer.routes';

import { Component } from '@angular/core';
import { HomeComponent } from './Component/Customer/home/home.component';
import { ClientProfileComponent } from './Component/Customer/client-profile/client-profile.component';


export const routes: Routes = [

  {path: '',component:HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'registerHamdyMan', component: HandymanRegistrationComponent },
  {
    path: 'admin', canActivate: [adminGuard], children: adminRoutes },

  { path: 'booking', component: BookingWizardComponent },

  { path: 'chat', component: ChatComponent },
  { path: 'handyman', canActivate: [handymanGuard],children: handymanRoutes},

  {path: 'customer', children: customerRoutes},
  {path: 'client-profile', component: ClientProfileComponent},



];
