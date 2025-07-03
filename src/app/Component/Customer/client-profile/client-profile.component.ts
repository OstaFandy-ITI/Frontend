import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-client-profile',
  imports: [CommonModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent  {
  showProfileScreen: boolean = true;


  showChangePassword(): void {
    this.showProfileScreen = false;
  }

 
  showProfile(): void {
    this.showProfileScreen = true;
  }
}