import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JwtService } from '../../core/services/jwt.service';
import { UserLoginDto, UserRegisterDto } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ResponseDto } from '../../core/models/Response';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule ,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  containerClass = '';
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _AuthService: AuthService,
    private router: Router,
    private _JwtService: JwtService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePanel(signUp: boolean) {
    this.containerClass = signUp ? 'right-panel-active' : '';
  }

  login() {
    console.log('Login function called');
    if (this.loginForm.invalid) return;
    const loginData = this.loginForm.value as UserLoginDto;
      console.log('Login data:', loginData);


    this._JwtService.Login(loginData).subscribe({
      
      next: (response: ResponseDto<string>) => {
        if (response && response.data) {
          this._AuthService.Login(response.data);
          console.log('Full login response:', response);
          this.toastr.success(response.message);
          this.router.navigate(['/']); //letter to home page
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
      },
    });
  }

  register() {
    if (this.registerForm.invalid) return;
    const registerData =  this.registerForm.value as UserRegisterDto;
    console.log('Register data:', registerData);

    this._JwtService.Register(registerData).subscribe({
      next: (response: ResponseDto<string>) => {
        if (response && response.data) {
          
          this._AuthService.Login(response.data);
          
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
      },
    });
  }

}
