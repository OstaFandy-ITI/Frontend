import { Component } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import{ AuthService} from "../../../../core/services/auth.service"
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule,RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  handymanDropdownOpen = true;

  constructor(private router: Router,private authService:AuthService) {}

  toggleHandymanDropdown() {
    this.handymanDropdownOpen = !this.handymanDropdownOpen;
  }

  logout() {
    this.authService.Logout();;
    this.router.navigate(['/login']);
  }
}
