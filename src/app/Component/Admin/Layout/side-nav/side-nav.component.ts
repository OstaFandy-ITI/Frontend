import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from "../../../../core/services/auth.service";
import { ThemeService } from "../../../../core/services/theme.service"; 
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminNotificationComponent } from '../../admin-notification/admin-notification.component'; 


@Component({
  selector: 'app-side-nav',
  imports: [CommonModule, RouterModule, AdminNotificationComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  handymanDropdownOpen = false;
  isDarkMode = false;
  private themeSubscription?: Subscription;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // الاشتراك في تغييرات الtheme
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (!this.sidebarOpen) {
      this.handymanDropdownOpen = false;
    }
  }

  toggleHandymanDropdown() {
    this.handymanDropdownOpen = !this.handymanDropdownOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}