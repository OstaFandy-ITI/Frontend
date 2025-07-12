import { CategoryService } from './../../Component/Admin/services/Category.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../Component/HandyMan/services/register.service';
import { ResponseDto } from '../../core/models/Response.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressTypes } from '../../core/Shared/Enum';
import { CategorySelect } from '../../core/models/category.models';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../Component/Customer/Layout/navbar/navbar.component';
import { FooterComponent } from '../../Component/Customer/Layout/footer/footer.component';
import { DashboardStatistics } from '../../core/models/dashboard.models';
import { DashboardService } from '../../Component/Admin/services/dashboard.service';

@Component({
  selector: 'app-handyman-registration',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './handyman-registration.component.html',
  styleUrl: './handyman-registration.component.css',
})
export class HandymanRegistrationComponent implements OnInit {
  CategoryItem: CategorySelect[] = [];
  addressTypes: string[] = [];
  cites: string[] = ['Cairo', 'Alexandria', 'Mansoura'];
  step = 1;
  isLoading: boolean = false;

  statistics: DashboardStatistics = {
    completedJobCount: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeClientCount: 0,
  };

  ngOnInit(): void {
    this.addressTypes = Object.values(AddressTypes);
    this.getCategories();
    this.loadStatistics();
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
    private toastr: ToastrService,
    private _CategoryService: CategoryService,
    private dashboardService: DashboardService
  ) {
    this.userForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      firstname: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z\s]{2,30}$/)],
      ],
      lastname: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z\s]{2,30}$/)],
      ],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/),
        ],
      ],
      confirmpassword: ['', Validators.required],
      SpecializationId: [null, Validators.required],
    });

    this.handymanForm = this.fb.group({
      Latitude: [null],
      Longitude: [null],
      NationalId: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{14}$/)],
      ],
      ExperienceYears: [
        null,
        [Validators.required, Validators.min(0), Validators.max(50)],
      ],
      Address: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
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
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmpassword')?.value;

    if (password !== confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

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
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load categories.' + err);
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
      this.isLoading = true;
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
            this.isLoading = false;
            this.toastr.success(response.message);
            this.router.navigate(['/handyman/pending']);
          } else {
            this.isLoading = false;
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error.error.message);
        },
      });
    }else{
      this.toastr.warning("Kindly complete all required fields.")
    }
  }

  //total customer
  //total complete booking
  loadStatistics(): void {
    this.dashboardService.getAllStatistics().subscribe({
      next: (data) => {
        this.statistics = data;

        this.animateCounter('activeClients', this.statistics.activeClientCount);
        this.animateCounter(
          'completedBookings',
          this.statistics.completedJobCount
        );
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      },
    });
  }

  //animation
  animateCounter(elementId: string, target: number, duration: number = 1500) {
    const element = document.getElementById(elementId)?.querySelector('.count');
    if (!element) return;

    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * target);

      element.textContent = currentCount.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCount);
  }
}
