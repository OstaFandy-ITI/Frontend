// // import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { HandymanService } from '../../services/handyman.service';
// import { AdminHandyManDTO, EditHandymanDTO } from '../../../../core/models/Adminhandyman.model';
// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

// @Component({
//   selector: 'app-handyman-edit',
//   templateUrl: './handyman-edit.component.html',
//   styleUrls: ['./handyman-edit.component.css'],
//   imports: [CommonModule, FormsModule, ReactiveFormsModule]
// })
// export class HandymanEditComponent implements OnChanges {
//   @Input() handyman!: AdminHandyManDTO;
//   @Input() isVisible = false;
//   @Output() close = new EventEmitter<void>();
//   @Output() updated = new EventEmitter<AdminHandyManDTO>();

//   editForm!: FormGroup;
//   activeTab = 'personal';
//   loading = false;
//   specializations: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private handymanService: HandymanService
//   ) {
//     this.initializeForm();
//     this.loadSpecializations();
//   }

//   ngOnChanges(): void {
//     if (this.handyman && this.editForm) {
//       if (this.specializations.length > 0) {
//         this.populateForm();
//       } else {
//         this.loadSpecializations();
//       }
//     }
//   }

//   initializeForm(): void {
//     this.editForm = this.fb.group({
//       userId: [''],
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: ['', Validators.required],
//       specializationId: ['', Validators.required],
//       latitude: [''],
//       longitude: [''],
//       nationalId: ['', Validators.required],
//       nationalIdImg: [''],
//       img: [''],
//       experienceYears: ['', [Validators.required, Validators.min(0)]],
//       status: ['', Validators.required]
//       // Removed address-related form controls
//     });
//   }

//   loadSpecializations(): void {
//     this.handymanService.getSpecializations().subscribe({
//       next: (specializations) => {
//         this.specializations = specializations;
//         if (this.handyman && this.editForm) {
//           this.populateForm();
//         }
//       },
//       error: (error) => {
//         console.error('Error loading specializations:', error);
//       }
//     });
//   }

//   private populateForm(): void {
//     this.editForm.patchValue({
//       userId: this.handyman.userId,
//       firstName: this.handyman.firstName,
//       lastName: this.handyman.lastName,
//       email: this.handyman.email,
//       phone: this.handyman.phone,
//       specializationId: this.getSpecializationId(this.handyman.specializationCategory),
//       latitude: this.handyman.latitude,
//       longitude: this.handyman.longitude,
//       nationalId: this.handyman.nationalId,
//       nationalIdImg: this.handyman.nationalIdImg || '',
//       img: this.handyman.img || '',
//       experienceYears: Number(this.handyman.experienceYears) || 0,
//       status: this.handyman.status
//       // Removed address-related field population
//     });
//   }

//   private getSpecializationId(category: string): string {
//     const specialization = this.specializations.find(s => s.category === category);
//     return specialization ? specialization.id.toString() : '';
//   }

//   // Removed getAddressData method as it's no longer needed

//   private validateFormData(data: EditHandymanDTO): { isValid: boolean; errors: string[] } {
//     const errors: string[] = [];

//     if (!data.userId) errors.push('User ID is missing');
//     if (!data.firstName?.trim()) errors.push('First name is required');
//     if (!data.lastName?.trim()) errors.push('Last name is required');
//     if (!data.email?.trim()) errors.push('Email is required');
//     if (!data.phone?.trim()) errors.push('Phone is required');
//     if (!data.nationalId?.trim()) errors.push('National ID is required');
//     if (!data.specializationId) errors.push('Specialization ID is required');
//     if (data.experienceYears === null || data.experienceYears === undefined || data.experienceYears < 0) {
//       errors.push('Experience years must be 0 or greater');
//     }
//     if (!data.status?.trim()) errors.push('Status is required');

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (data.email && !emailRegex.test(data.email)) {
//       errors.push('Invalid email format');
//     }

//     if (data.phone && data.phone.length < 10) {
//       errors.push('Phone number too short');
//     }

//     if (data.specializationId && !this.specializations.find(s => s.id.toString() === data.specializationId.toString())) {
//       errors.push('Invalid specialization ID');
//     }

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }

//   onSubmit(): void {
//     if (this.editForm.valid && !this.loading) {
//       this.loading = true;
//       const editData: EditHandymanDTO = this.editForm.value;

//       const validation = this.validateFormData(editData);
//       if (!validation.isValid) {
//         console.error('Validation errors:', validation.errors);
//         this.loading = false;
//         return;
//       }

//       this.handymanService.updateHandyman(editData.userId, editData).subscribe({
//         next: (updatedHandyman) => {
//           this.loading = false;
//           this.updated.emit(updatedHandyman);
//           this.onClose();
//         },
//         error: (error) => {
//           console.error('Error updating handyman:', error);
//           console.error('Validation errors:', error.error?.errors || []);
//           this.loading = false;
//         }
//       });
//     } else {
//       this.markFormGroupTouched();
//     }
//   }

//   private markFormGroupTouched(): void {
//     Object.keys(this.editForm.controls).forEach(key => {
//       const control = this.editForm.get(key);
//       if (control) {
//         control.markAsTouched();
//       }
//     });
//   }

//   onClose(): void {
//     this.close.emit();
//     this.resetForm();
//   }

//   private resetForm(): void {
//     this.editForm.reset();
//     this.activeTab = 'personal';
//   }

//   switchTab(tab: string): void {
//     this.activeTab = tab;
//   }

//   calculateTotalSpent(): number {
//     if (this.handyman?.jobAssignments && this.handyman.jobAssignments.length > 0) {
//       return this.handyman.jobAssignments.length * 100;
//     }
//     return 0;
//   }

//   canSubmit(): boolean {
//     return this.editForm.valid && !this.loading;
//   }

//   debugFormErrors(): void {
//     console.log('Form valid:', this.editForm.valid);
//     console.log('Form errors:', this.editForm.errors);

//     Object.keys(this.editForm.controls).forEach(key => {
//       const control = this.editForm.get(key);
//       if (control && control.invalid) {
//         console.log(`${key} is invalid:`, control.errors);
//       }
//     });
//   }

//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.editForm.get(fieldName);
//     return !!(field && field.invalid && field.touched);
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.editForm.get(fieldName);
//     if (field && field.errors && field.touched) {
//       if (field.errors['required']) {
//         return `${this.getFieldDisplayName(fieldName)} is required`;
//       }
//       if (field.errors['email']) {
//         return 'Please enter a valid email address';
//       }
//       if (field.errors['min']) {
//         return `${this.getFieldDisplayName(fieldName)} must be 0 or greater`;
//       }
//     }
//     return '';
//   }

//   private getFieldDisplayName(fieldName: string): string {
//     const displayNames: { [key: string]: string } = {
//       firstName: 'First Name',
//       lastName: 'Last Name',
//       email: 'Email',
//       phone: 'Phone',
//       nationalId: 'National ID',
//       specializationId: 'Specialization',
//       experienceYears: 'Experience Years',
//       status: 'Status'
//     };
//     return displayNames[fieldName] || fieldName;
//   }
// }
// handyman-edit.component.ts
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HandymanService } from '../../services/handyman.service';
import { AdminHandyManDTO, EditHandymanDTO } from '../../../../core/models/Adminhandyman.model';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild, ElementRef, OnInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-handyman-edit',
  templateUrl: './handyman-edit.component.html',
  styleUrls: ['./handyman-edit.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class HandymanEditComponent implements OnChanges, OnInit {
  @Input() handyman!: AdminHandyManDTO;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<AdminHandyManDTO>();
  @ViewChild('editModal', { static: false }) editModal!: ElementRef;

  editForm!: FormGroup;
  activeTab = 'personal';
  loading = false;
  specializations: any[] = [];
  private modalInstance: any;

  constructor(
    private fb: FormBuilder,
    private handymanService: HandymanService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSpecializations();
  }

  ngOnChanges(): void {
    if (this.handyman && this.editForm) {
      if (this.specializations.length > 0) {
        this.populateForm();
      } else {
        this.loadSpecializations();
      }
    }
    
    // Handle modal visibility
    setTimeout(() => {
      if (this.isVisible) {
        this.showModal();
      } else {
        this.hideModal();
      }
    }, 100);
  }

  private showModal(): void {
    if (this.editModal && typeof bootstrap !== 'undefined') {
      this.modalInstance = new bootstrap.Modal(this.editModal.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
      this.modalInstance.show();
    }
  }

  private hideModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  initializeForm(): void {
    this.editForm = this.fb.group({
      userId: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specializationId: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      nationalId: ['', Validators.required],
      nationalIdImg: [''],
      img: [''],
      experienceYears: ['', [Validators.required, Validators.min(0)]],
      status: ['', Validators.required]
    });
  }

  loadSpecializations(): void {
    this.handymanService.getSpecializations().subscribe({
      next: (specializations) => {
        this.specializations = specializations;
        if (this.handyman && this.editForm) {
          this.populateForm();
        }
      },
      error: (error) => {
        console.error('Error loading specializations:', error);
      }
    });
  }

  private populateForm(): void {
    this.editForm.patchValue({
      userId: this.handyman.userId,
      firstName: this.handyman.firstName,
      lastName: this.handyman.lastName,
      email: this.handyman.email,
      phone: this.handyman.phone,
      specializationId: this.getSpecializationId(this.handyman.specializationCategory),
      latitude: this.handyman.latitude,
      longitude: this.handyman.longitude,
      nationalId: this.handyman.nationalId,
      nationalIdImg: this.handyman.nationalIdImg || '',
      img: this.handyman.img || '',
      experienceYears: Number(this.handyman.experienceYears) || 0,
      status: this.handyman.isActive ? 'Active' : 'Inactive'
    });
  }

  private getSpecializationId(category: string): string {
    const specialization = this.specializations.find(s => s.category === category);
    return specialization ? specialization.id.toString() : '';
  }

  private validateFormData(data: EditHandymanDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) errors.push('User ID is missing');
    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.phone?.trim()) errors.push('Phone is required');
    if (!data.nationalId?.trim()) errors.push('National ID is required');
    if (!data.specializationId) errors.push('Specialization ID is required');
    if (data.experienceYears === null || data.experienceYears === undefined || data.experienceYears < 0) {
      errors.push('Experience years must be 0 or greater');
    }
    if (!data.status?.trim()) errors.push('Status is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && data.phone.length < 10) {
      errors.push('Phone number too short');
    }

    if (data.specializationId && !this.specializations.find(s => s.id.toString() === data.specializationId.toString())) {
      errors.push('Invalid specialization ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.loading) {
      this.loading = true;
      const editData: EditHandymanDTO = this.editForm.value;

      const validation = this.validateFormData(editData);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        this.loading = false;
        return;
      }

      this.handymanService.updateHandyman(editData.userId, editData).subscribe({
        next: (updatedHandyman) => {
          this.loading = false;
          this.updated.emit(updatedHandyman);
          this.onClose();
        },
        error: (error) => {
          console.error('Error updating handyman:', error);
          console.error('Validation errors:', error.error?.errors || []);
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onClose(): void {
    this.hideModal();
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.editForm.reset();
    this.activeTab = 'personal';
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  calculateTotalSpent(): number {
    if (this.handyman?.jobAssignments && this.handyman.jobAssignments.length > 0) {
      return this.handyman.jobAssignments.length * 100;
    }
    return 0;
  }

  canSubmit(): boolean {
    return this.editForm.valid && !this.loading;
  }

  debugFormErrors(): void {
    console.log('Form valid:', this.editForm.valid);
    console.log('Form errors:', this.editForm.errors);

    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control && control.invalid) {
        console.log(`${key} is invalid:`, control.errors);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be 0 or greater`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      nationalId: 'National ID',
      specializationId: 'Specialization',
      experienceYears: 'Experience Years',
      status: 'Status'
    };
    return displayNames[fieldName] || fieldName;
  }
}