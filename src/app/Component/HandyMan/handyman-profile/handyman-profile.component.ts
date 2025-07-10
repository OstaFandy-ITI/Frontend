import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HandymanProfileService } from '../services/handyman-profile.service';
import { HandymanProfile } from '../../../core/models/HandymanProfile.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-handyman-profile',
  imports: [CommonModule],
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
  imagePreview: string | null = null;
  isDragOver = false;

  handymanId: number = 0;

  constructor(
    private handymanProfileService: HandymanProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.handymanId = userId;
      this.loadHandymanProfile();
    } else {
      this.error = 'Unable to determine logged-in user.';
    }
  }

  loadHandymanProfile(): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.handymanProfileService.getHandymanProfile(this.handymanId).subscribe({
      next: (profile: HandymanProfile) => {
        this.handymanProfile = profile;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'An error occurred while loading the profile';
        this.loading = false;
      }
    });
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