import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JwtService } from '../../core/services/jwt.service';
import { UserLoginDto, UserRegisterDto } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ResponseDto } from '../../core/models/Response.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserType } from '../../core/Shared/Enum';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  containerClass = '';
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _AuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _JwtService: JwtService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^01[0125][0-9]{8}$/), 
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }
  ngOnInit(): void {
     this.route.queryParams.subscribe(params => {
    if (params['verified'] === 'true') {
      this.toastr.success('Your email was verified successfully! You can now log in.');
    }
  });
  }

  //animation for the login and register panels
  togglePanel(signUp: boolean) {
    this.containerClass = signUp ? 'right-panel-active' : '';
  }

  //login subscription
  login() {
    console.log('Login function called');
    if (this.loginForm.invalid) return;
    const loginData = this.loginForm.value as UserLoginDto;
    this._JwtService.Login(loginData).subscribe({
      next: (response: ResponseDto<string>) => {
        if (response.isSuccess && response.data) {
          this._AuthService.Login(response.data);
          this._AuthService.CurrentUser$.subscribe((user) => {
            if (user) {
              this.toastr.success(response.message);
              if (user.UserType === UserType.Admin) {
                this.router.navigate(['/admin/AdminDashboard']);
              } else if (user.UserType === UserType.Customer) {
                this.router.navigate(['/']);
              } else if (user.UserType === UserType.Handyman) {
                this.router.navigate(['/handyman/dashboard']);
              }
            }
          });
        }
      },
      error: (error) => {
        if (error.error.data == 'Pending') {
          this.router.navigate(['/handyman/pending']);
        } else if (error.error.data == 'Rejected') {
          this.router.navigate(['/handyman/rejected']);
        } else {
          this.toastr.error(error.error.message);
        }
      },
    });
  }

  //register subscription
  register() {
    if (this.registerForm.invalid) return;
    const registerData = this.registerForm.value as UserRegisterDto;
    console.log('Register data:', registerData);

    this._JwtService.Register(registerData).subscribe({
      next: (response: ResponseDto<string>) => {
        if (response && response.data) {
          this.toastr.success(response.message);
          localStorage.setItem("pendingUserEmail", response.data);
          this.router.navigate(['/verifyemail']);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }
}
