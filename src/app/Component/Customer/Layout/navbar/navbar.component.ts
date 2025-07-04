import { NotificationComponent } from '../../notification/notification.component'; 
// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to authentication state reactively
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
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
    this.router.navigate(['/login']);
  }
}
