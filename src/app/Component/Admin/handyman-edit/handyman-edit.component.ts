import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HandymanService } from '../services/handyman.service';
import { AdminHandyManDTO, EditHandymanDTO } from '../../../core/models/Adminhandyman.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-handyman-edit',
  templateUrl: './handyman-edit.component.html',
  styleUrls: ['./handyman-edit.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class HandymanEditComponent implements OnChanges {
  @Input() handyman!: AdminHandyManDTO;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<AdminHandyManDTO>();

  editForm!: FormGroup;
  activeTab = 'personal';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private handymanService: HandymanService
  ) {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.handyman && this.editForm) {
      this.populateForm();
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
      status: ['', Validators.required],
      defaultAddressPlace: [''],
      addressType: [''],
      defaultAddressCity: [''],
      defaultAddressLatitude: [''],
      defaultAddressLongitude: ['']
    });
  }

  populateForm(): void {
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
      status: this.handyman.status,
      defaultAddressPlace: this.handyman.defaultAddress?.address1 || '',
      addressType: this.handyman.defaultAddress?.addressType || '',
      defaultAddressCity: this.handyman.defaultAddress?.city || '',
      defaultAddressLatitude: this.handyman.defaultAddress?.latitude || '',
      defaultAddressLongitude: this.handyman.defaultAddress?.longitude || ''
    });
  }

  private getSpecializationId(category: string): string {
    const mapping: { [key: string]: string } = {
      'Plumbing': '1',
      'Electrical': '2',
      'Carpentry': '3',
      'Painting': '4',
      'HVAC': '5'
    };
    return mapping[category] || '';
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.loading) {
      this.loading = true;
      const editData: EditHandymanDTO = this.editForm.value;
      
      this.handymanService.updateHandyman(editData.userId, editData).subscribe({
        next: (updatedHandyman) => {
          this.loading = false;
          this.updated.emit(updatedHandyman);
          this.onClose();
        },
        error: (error) => {
          console.error('Error updating handyman:', error);
          this.loading = false;
          // You might want to show a user-friendly error message here
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
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
    // Mock calculation - implement based on your business logic
    // You might want to calculate this based on actual job data
    if (this.handyman?.jobAssignments && this.handyman.jobAssignments.length > 0) {
      // Example calculation - replace with actual logic
      return this.handyman.jobAssignments.length * 100;
    }
    return 0;
  }

  // Helper method to check if form can be submitted
  canSubmit(): boolean {
    return this.editForm.valid && !this.loading;
  }

  // Debug method - remove in production
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

  // Helper methods for template
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