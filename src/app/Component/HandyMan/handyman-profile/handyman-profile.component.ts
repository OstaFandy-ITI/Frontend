import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HandymanProfileService } from '../services/handyman-profile.service';
import { 
  HandymanProfile, 
  UpdateHandymanProfileRequest 
} from '../../../core/models/HandymanProfile.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-handyman-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './handyman-profile.component.html',
  styleUrls: ['./handyman-profile.component.css']
})
export class HandymanProfileComponent implements OnInit {
  handymanProfile: HandymanProfile = {
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePictureUrl: '',
    specializationName: '',
    experienceYears: 0,
    status: '',
    defaultAddress: '',
    city: '',
    latitude: 0,
    longitude: 0
  };

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  selectedFile: File | null = null;
  uploadingPhoto = false;
  showPhotoModal = false;
  showUpdateForm = false;
  imagePreview: string | null = null;
  isDragOver = false;

  updateProfileForm!: FormGroup;
  handymanId: number = 0;

  constructor(
    private handymanProfileService: HandymanProfileService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.handymanId = userId;
      this.loadHandymanProfile();
    } else {
      this.error = 'Unable to determine logged-in user.';
    }
  }

  private initializeForm(): void {
    // Remove required validators to make inputs optional
    this.updateProfileForm = this.fb.group({
      firstName: ['', [Validators.minLength(2)]],
      lastName: ['', [Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^\d{10,}$/)]],
      experienceYears: ['', [Validators.min(0), Validators.max(50)]]
    });
  }

  loadHandymanProfile(): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.handymanProfileService.getHandymanProfile(this.handymanId).subscribe({
      next: (profile: HandymanProfile) => {
        this.handymanProfile = profile;
        this.populateUpdateForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'An error occurred while loading the profile';
        this.loading = false;
      }
    });
  }

  private populateUpdateForm(): void {
    if (this.handymanProfile) {
      this.updateProfileForm.patchValue({
        firstName: this.handymanProfile.firstName,
        lastName: this.handymanProfile.lastName,
        phone: this.handymanProfile.phone,
        experienceYears: this.handymanProfile.experienceYears
      });
    }
  }

  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.error = null;
    this.successMessage = null;

    if (this.showUpdateForm) {
      this.populateUpdateForm();
    }
  }

  onUpdateProfile(): void {
  if (this.updateProfileForm.invalid || this.loading) {
    return;
  }

  this.loading = true;
  this.error = null;
  this.successMessage = null;

  const formValues = this.updateProfileForm.value;
  const updateData: UpdateHandymanProfileRequest = {firstName: '', lastName: '', phone: '', experienceYears: 0};

  // Only include fields that have values
  if (formValues.firstName && formValues.firstName.trim()) {
    updateData.firstName = formValues.firstName.trim();
  }
  if (formValues.lastName && formValues.lastName.trim()) {
    updateData.lastName = formValues.lastName.trim();
  }
  if (formValues.phone && formValues.phone.trim()) {
    updateData.phone = formValues.phone.trim();
  }
  if (formValues.experienceYears !== null && formValues.experienceYears !== undefined) {
    updateData.experienceYears = Number(formValues.experienceYears);
  }

  this.handymanProfileService.updateHandymanProfile(this.handymanId, updateData)
    .subscribe({
      next: (response) => {
        this.handleUpdateSuccess(response);
      },
      error: (error) => {
        this.handleUpdateError(error);
      }
    });
}



private handleUpdateSuccess(response: any): void {
  this.loading = false;
  
  if (response.message && response.message.includes('successfully')) {
    this.successMessage = response.message;
    this.showUpdateForm = false;
    
    // Update local profile data if needed
    if (response.date) {
      this.handymanProfile = {
        ...this.handymanProfile,
        ...response.date,
        // Map any mismatched property names
        experienceYears: response.date.experienceYear,
        latitude: response.date.initName
      };
    }
    
    // Optional: Reload the profile
    this.loadHandymanProfile();
  } else {
    this.error = response.message || 'Profile update failed';
  }
}

 private handleUpdateError(error: any): void {
  this.loading = false;
  
  if (error.error && error.error.message) {
    this.error = error.error.message;
  } else if (error.message) {
    this.error = error.message;
  } else {
    this.error = 'An unknown error occurred during update';
  }
  
  console.error('Update error:', error);
}

  private hasValidationErrors(): boolean {
    const controls = this.updateProfileForm.controls;
    
    // Check each control for errors only if it has a value
    for (const [key, control] of Object.entries(controls)) {
      if (control.value && control.value.toString().trim() && control.errors) {
        control.markAsTouched();
        return true;
      }
    }
    return false;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.updateProfileForm.get(controlName);
    // Only show error if field has a value and has an error
    return !!(control && control.value && control.value.toString().trim() && 
             control.hasError(errorType) && (control.dirty || control.touched));
  }

  openPhotoModal(): void {
    this.showPhotoModal = true;
    this.clearSelectedFile();
    this.clearMessages();
  }

  closePhotoModal(): void {
    if (this.uploadingPhoto) {
      return; // Prevent closing while uploading
    }
    this.showPhotoModal = false;
    this.clearSelectedFile();
    this.clearMessages();
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePhoto') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processSelectedFile(file);
    }
  }

  processSelectedFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error = 'Please select a valid image file';
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      this.error = 'File size must be less than 5MB';
      return;
    }

    this.selectedFile = file;
    this.error = null;
    this.generateImagePreview(file);
  }

  generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processSelectedFile(files[0]);
    }
  }

  onUpdateProfilePhoto(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.uploadingPhoto = true;
    this.error = null;
    this.successMessage = null;

    this.handymanProfileService.updateHandymanProfilePhoto(this.handymanId, this.selectedFile).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.handymanProfile.profilePictureUrl = response.profilePictureUrl;
        this.uploadingPhoto = false;
        this.closePhotoModal();
      },
      error: (error) => {
        this.error = 'An error occurred while updating the profile photo';
        this.uploadingPhoto = false;
      }
    });
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
    const fileInput = document.getElementById('profilePhoto') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
}