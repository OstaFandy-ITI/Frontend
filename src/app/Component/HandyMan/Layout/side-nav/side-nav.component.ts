import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import{ AuthService} from "../../../../core/services/auth.service"
import { Router } from '@angular/router';
@Component({
  selector: 'app-side-nav',
  imports: [CommonModule,RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
sidebarOpen = true;
  handymanDropdownOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (!this.sidebarOpen) {
      this.handymanDropdownOpen = false;
    }
  }

  toggleHandymanDropdown() {
    this.handymanDropdownOpen = !this.handymanDropdownOpen;
  }

  logout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}
