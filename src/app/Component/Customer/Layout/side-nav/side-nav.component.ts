import { Component, ViewChild, viewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from "../../../../core/services/auth.service";
import { NavbarComponent } from "../navbar/navbar.component"; 

@Component({
  selector: 'app-side-nav',
  standalone: true, 

  imports: [RouterModule, CommonModule, NavbarComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent  {
  sidebarOpen = true;
  currentClientId: number | null = null;
  @ViewChild('sidebarToggle') sidebarToggle: any;
  
  constructor(private router: Router, private authService: AuthService) { }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (!this.sidebarOpen) {
      this.sidebarToggle.nativeElement.classList.add('toogle-btn-positon');
    } else {
      this.sidebarToggle.nativeElement.classList.remove('toogle-btn-positon');
    }
  }

  logout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}


