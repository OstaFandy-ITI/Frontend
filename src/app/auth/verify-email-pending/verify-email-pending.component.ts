import { ToastrService } from 'ngx-toastr';
import { JwtService } from './../../core/services/jwt.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-verify-email-pending',
  imports: [],
  templateUrl: './verify-email-pending.component.html',
  styleUrl: './verify-email-pending.component.css'
})
export class VerifyEmailPendingComponent {
    useremail = localStorage.getItem("pendingUserEmail");
    loading = false;

  constructor(private jwtService:JwtService,private toastr:ToastrService)
  {

  }

  ResendVerification()
  {
    this.loading = true;

    this.jwtService.ResendVerification(this.useremail!).subscribe({
      next:(res)=>{
        this.loading = false;
        this.toastr.success(res.message)
      },error:(err)=>{
        this.toastr.error(err.error.message)
      }
    })

  }
}
