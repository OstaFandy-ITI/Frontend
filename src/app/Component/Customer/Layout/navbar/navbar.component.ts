import { NotificationComponent } from '../../notification/notification.component'; 
 import { Component,  OnInit, OnDestroy } from '@angular/core';
import { Router ,RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from "../../../../core/services/theme.service"; // اضبط المسار حسب structure بتاعك


 @Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, NotificationComponent ,RouterModule],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription?: Subscription;

  isLoggedIn = false;
 userName: string | null = null;
 usertype:string| null = null;
  constructor(private authService: AuthService, private router: Router,private themeService: ThemeService
) {}

ngOnInit(): void {
  this.authService.isAuthenticated$.subscribe(status => {
    this.isLoggedIn = status;
  });

  this.authService.CurrentUser$.subscribe(user => {
    this.userName = user?.GivenName ?? null;
    this.usertype=user?.UserType??null;
  });

  this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
}
ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }


  goToProfile() {
    this.router.navigate(['/client/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/']);
  }
}
