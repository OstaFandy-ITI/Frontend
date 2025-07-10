import { routes } from './../../app.routes';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { JwtService } from './../../core/services/jwt.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResetPasswordDto } from '../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  step: number = 1;
  email: string = '';

  minutes: number = 15;
  seconds: number = 0;
  timer: any;
  expired: boolean = false;

  OTP: string = '';
  pass: string = '';
  confirmpass = '';
  constructor(private jwtService: JwtService, private toastr: ToastrService,private router:Router) {}

  forgetPass() {
    if (!this.email) {
      this.toastr.warning('Please enter your email.');
      return;
    }

    this.jwtService.ForgetPass(this.email).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.step = 2;
        this.startTimer();
      },
      error: (err) => {
        this.toastr.error(err.error.message);
      },
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.seconds === 0) {
        if (this.minutes === 0) {
          this.expired = true;
          clearInterval(this.timer);
        } else {
          this.minutes--;
          this.seconds = 59;
        }
      } else {
        this.seconds--;
      }
    }, 1000);
  }

  resetpass() {
    if (!this.OTP || !this.pass || !this.confirmpass) {
      this.toastr.warning('Please fill all fields.');
      return;
    }

    if (this.pass !== this.confirmpass) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    const dto: ResetPasswordDto = {
      email: this.email,
      otp: this.OTP,
      newPassword: this.pass,
    };

    this.jwtService.ResetPass(dto).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        this.toastr.error(err.error.message);
      },
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
