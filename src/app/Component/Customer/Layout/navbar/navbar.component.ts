import { Component } from '@angular/core';
import { NotificationComponent } from '../../notification/notification.component'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NotificationComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}
logout() {
  localStorage.removeItem('token'); 
  this.router.navigate(['/login']);
}
}
