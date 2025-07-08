import { NotificationComponent } from '../../notification/notification.component'; 
 import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
 @Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, NotificationComponent ,],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
 userName: string | null = null;
  constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
  this.authService.isAuthenticated$.subscribe(status => {
    this.isLoggedIn = status;
  });

  this.authService.CurrentUser$.subscribe(user => {
    this.userName = user?.GivenName ?? null;
  });
}


  goToProfile() {
    this.router.navigate(['/client/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/']);
  }
}
