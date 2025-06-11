// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { provideHttpClient } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { PaymentsComponent } from './app/Component/Admin/payments/payments.component';

// // bootstrapApplication(AppComponent, {
// //   providers: [
// //     provideHttpClient(),
// //     provideRouter([
// //       // {
// //       //   path: 'admin',
// //       //   children: [
// //       //     { path: 'payments', component: PaymentsComponent },
// //       //     { path: '', redirectTo: 'payments', pathMatch: 'full' }
// //       //   ]
// //       // },
// //       { path: '', redirectTo: '/admin', pathMatch: 'full' }
// //     ])
// //   ]
// // }).catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));