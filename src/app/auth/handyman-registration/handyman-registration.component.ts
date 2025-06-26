import { CategoryService } from './../../Component/Admin/services/Category.service';
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
import { CategorySelect } from '../../core/models/category.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-handyman-registration',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './handyman-registration.component.html',
  styleUrl: './handyman-registration.component.css',
})
export class HandymanRegistrationComponent implements OnInit {
  CategoryItem: CategorySelect[] = [];
  addressTypes: string[] = [];
  cites: string[] = ['Cairo', 'Alexandria', 'Mansoura'];
  step = 1;

  ngOnInit(): void {
    this.addressTypes = Object.values(AddressTypes);
    this.getCategories();
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
    private toastr: ToastrService,
    private _CategoryService: CategoryService
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
      ExperienceYears: [, Validators.required],
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

  //check if field is invalid

  isFieldInvalid(form: FormGroup, fieldName: string) {
  const field = form.get(fieldName);
  return field && field.invalid && (field.dirty || field.touched);
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
      this.getLocationCoordinates();
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

    if (cashedData) {
      const cacheItem = JSON.parse(cashedData);
      const now = Date.now();
      if (now < cacheItem.expiry) {
        this.CategoryItem = cacheItem.value.map((category: any) => ({
          id: category.id,
          name: category.name,
        }));
        return this.CategoryItem;
      } else {
        localStorage.removeItem(cashekey);
      }
    }

    return this._CategoryService.getAll().subscribe({
      next: (Response) => {
        if (Response) {
          const cacheItem = {
            value: Response.map((category) => ({
              id: category.id,
              name: category.name,
            })),
            expiry: Date.now() + 24 * 60 * 60 * 1000, // Cache for 24 hours
          };
          localStorage.setItem(cashekey, JSON.stringify(cacheItem));
          this.CategoryItem = cacheItem.value;
          this.toastr.error('Failed to load categories.');
        }
      },
    });
  }

  //get location coordinates
  getLocationCoordinates() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handymanForm.patchValue({
            Latitude: position.coords.latitude,
            Longitude: position.coords.longitude,
          });
          this.toastr.success('Location coordinates fetched successfully.');
        },
        () => {
          this.toastr.error('Failed to fetch location coordinates.');
        }
      );
    } else {
      this.toastr.error('Geolocation is not supported by this browser.');
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
