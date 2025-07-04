import { AdminHandyManDTO } from './../../../../core/models/Adminhandyman.model';
import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HandymanService } from '../../../Admin/services/handyman.service';
import { HandymanApplication } from '../../../../core/models/Handyman.model';
import { UserType } from '../../../../core/Shared/Enum';
import {HandymanNotificationsComponent} from '../../handyman-notification/handyman-notification.component';
@Component({
  selector: 'app-side-nav',
  imports: [CommonModule, RouterModule, HandymanNotificationsComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent implements OnInit {
  sidebarOpen = true;
  userId?: number;
  handyman?: AdminHandyManDTO;
  imgsrc?: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private handymanService: HandymanService,
  ) {}

  ngOnInit(): void {
    this.getuserdetails();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }

  getuserdetails() {
    this.authService.CurrentUser$.subscribe((user) => {
      if (!user || user.UserType !== UserType.Handyman) {
        this.router.navigate(['/login']);
        return;
      }


      this.userId = Number(user.NameIdentifier);

      this.handymanService.getHandymanById(this.userId).subscribe({
        next: (handyman) => {
          this.handyman = handyman;
          this.imgsrc = handyman.img;
          console.log('Handyman loaded:', this.handyman);
        },
        error: (err) => {
          console.error('Error loading handyman:', err);
        },
      });
    });
  }
}

