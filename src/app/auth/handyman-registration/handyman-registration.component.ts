import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../Component/HandyMan/services/register.service';
import { ResponseDto } from '../../core/models/Response.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { JwtService } from '../../core/services/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressTypes } from '../../core/Shared/Enum';

@Component({
  selector: 'app-handyman-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './handyman-registration.component.html',
  styleUrl: './handyman-registration.component.css',
})
export class HandymanRegistrationComponent implements OnInit {
  //cacheItem: CacheItem<Category[]>
  addressTypes: string[] = [];
  step = 1;

  ngOnInit(): void {
    this.addressTypes = Object.values(AddressTypes);
  }

  //forms
  userForm: FormGroup;
  handymanForm: FormGroup;

  //images
  nationalIdImg?: File;
  profileImg?: File;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private _AuthService: AuthService,
    private router: Router,
    private _JwtService: JwtService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
      SpecializationId: [null, Validators.required],
    });

    this.handymanForm = this.fb.group({
      Latitude: [null],
      Longitude: [null],
      NationalId: ['', Validators.required],
      ExperienceYears: [0, Validators.required],
      Address: ['', Validators.required],
      City: ['', Validators.required],
      AddressType: ['', Validators.required],
      IsDefault: [true],
    });
  }

  //photo upload handlers
  onNationalIdSelected(event: any) {
    this.nationalIdImg = event.target.files[0];
  }

  onProfileImgSelected(event: any) {
    this.profileImg = event.target.files[0];
  }

  //handel moving to next step
  nextStep() {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      this.toastr.error('Please fill all required fields in the user form.');
      return;
    }

    if (this.step === 1) {
      this.step = 2;
    }
  }

  previousStep() {
    this.step = 1;
  }

  //get catogories and cash it
  getCategories() {
    //get cashed categories from localStorage
    const cashekey = 'categories';
    const cashedData = localStorage.getItem(cashekey);

    if(cashedData){

    }
  }

  //submit registration
  submit() {
    if (this.userForm.valid && this.handymanForm.valid) {
      const handymanData = {
        ...this.userForm.value,
        ...this.handymanForm.value,
        NationalIdImg: this.nationalIdImg,
        Img: this.profileImg,
      };

      //subscribe to the registration service
      this.registerService.RegisterHandyMan(handymanData).subscribe({
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
}
