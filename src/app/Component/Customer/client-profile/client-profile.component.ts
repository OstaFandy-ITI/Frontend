import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientProfileService } from '../services/client-profile.service';
import { AddressService } from '../services/address.service';
import {
  ClientProfile,
  UpdateClientProfileRequest,
  ApiResponse,
  Address 
} from '../../../core/models/ClientProfile.model';
import { AddressDTO, CreateAddressDTO } from '../../../core/models/Address.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-profile',
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {
  clientProfile: ClientProfile = {
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: false,
    createdAt: '',
    updatedAt: '',
    addresses: [],
    defaultAddress: null
  };
  addresses: AddressDTO[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  showUpdateForm = false;
  showAddressForm = false;

  updateProfileForm!: FormGroup;
  addAddressForm!: FormGroup;

  clientId: number = 0;

  loadingLocation = false;
  locationError: string | null = null;

  constructor(
    private clientProfileService: ClientProfileService,
    private addressService: AddressService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.clientId = userId;
      this.loadClientProfile();
      this.getAddresses();
    } else {
      this.error = 'Unable to determine logged-in user.';
    }
  }

  private initializeForms(): void {
    this.updateProfileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,}$/)]]
    });

    this.addAddressForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required], 
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      addressType: ['Home', Validators.required],
      isDefault: [false],
      isActive: [true]
    });
  }

  loadClientProfile(): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.clientProfileService.getClientProfile(this.clientId).subscribe({
      next: (response: ApiResponse<ClientProfile>) => {
        if (response.isSuccess && response.data) {
          this.clientProfile = response.data;
          if (!this.clientProfile.addresses) {
            this.clientProfile.addresses = [];
          }
          this.populateUpdateForm();
          // Debug: log addresses from profile (may be empty)
          console.log('Addresses loaded from profile:', this.clientProfile.addresses);
        } else {
          this.error = response.message || 'Failed to load client profile';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'An error occurred while loading the profile';
        this.loading = false;
      }
    });
  }

  getAddresses(): void {
    this.addressService.GetAddressesByUserId(this.clientId).subscribe({
      next: (addresses) => {
        this.addresses = addresses || [];
        console.log('Addresses loaded from AddressService:', this.addresses);
      },
      error: (error) => {
        this.error = 'Failed to load addresses';
        this.addresses = [];
      }
    });
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by this browser.';
      this.error = this.locationError;
      return;
    }

    this.loadingLocation = true;
    this.locationError = null;
    this.error = null;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        this.addAddressForm.patchValue({
          latitude: latitude,
          longitude: longitude
        });
        
        this.loadingLocation = false;
        this.successMessage = 'Location coordinates updated successfully!';
       
      },
      (error) => {
        this.loadingLocation = false;
        let errorMessage = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        this.locationError = errorMessage;
        this.error = errorMessage;
      },
      options
    );
  }

  toggleAddressForm(): void {
    this.showAddressForm = !this.showAddressForm;
    this.error = null;
    this.successMessage = null;
    this.locationError = null;
    this.loadingLocation = false;

    if (!this.showAddressForm) {
      this.addAddressForm.reset({
        addressType: 'Home',
        isDefault: false,
        isActive: true
      });
    }
  }

  private populateUpdateForm(): void {
    if (this.clientProfile) {
      this.updateProfileForm.patchValue({
        firstName: this.clientProfile.firstName,
        lastName: this.clientProfile.lastName,
        email: this.clientProfile.email,
        phone: this.clientProfile.phone
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
    if (this.updateProfileForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const updateData: UpdateClientProfileRequest = {
        firstName: this.updateProfileForm.value.firstName,
        lastName: this.updateProfileForm.value.lastName,
        email: this.updateProfileForm.value.email,
        phone: this.updateProfileForm.value.phone
      };

      this.clientProfileService.updateClientProfile(this.clientId, updateData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.successMessage = 'Profile updated successfully!';
            this.showUpdateForm = false;
            this.loadClientProfile();
          } else {
            this.error = response.message || 'Failed to update profile';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'An error occurred while updating the profile';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.updateProfileForm.controls).forEach(key => {
        this.updateProfileForm.get(key)?.markAsTouched();
      });
    }
  }

  onAddAddress(): void {
    if (this.addAddressForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const addressData = new CreateAddressDTO(
        this.clientId,
        this.addAddressForm.value.address,
        this.addAddressForm.value.city,
        parseFloat(this.addAddressForm.value.latitude),
        parseFloat(this.addAddressForm.value.longitude),
        this.addAddressForm.value.addressType,
        this.addAddressForm.value.isDefault,
        this.addAddressForm.value.isActive,
        new Date()
      );

      this.addressService.CreateAddress(addressData).subscribe({
        next: (response) => {
          if (response.isSuccess && response.statusCode !== 400) {
            this.successMessage = 'Address added successfully!';
            this.showAddressForm = false;
            this.getAddresses();
            this.addAddressForm.reset({
              addressType: 'Home',
              isDefault: false,
              isActive: true
            });
          } else {
            this.error = response.message || 'Failed to add address due to an unknown issue.';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'An error occurred while adding the address';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.addAddressForm.controls).forEach(key => {
        this.addAddressForm.get(key)?.markAsTouched();
      });
      if (!this.clientProfile) {
        this.error = "Client profile data is missing. Please try reloading the page.";
      }
    }
  }

  setDefaultAddress(addressId: number): void {
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    const newDefault = this.addresses.find(addr => addr.id === addressId) || null;
    if (newDefault) {
      this.clientProfile.defaultAddress = {
        ...newDefault,
        address: newDefault.address1, 
        createdAt: newDefault.createdAt
          ? (newDefault.createdAt instanceof Date
              ? newDefault.createdAt.toISOString()
              : newDefault.createdAt)
          : ''
      } as Address;
    }
    this.successMessage = 'Default address updated!';
  }

  getFormControl(formName: 'update' | 'address', controlName: string) {
    const form = formName === 'update' ? this.updateProfileForm : this.addAddressForm;
    return form.get(controlName);
  }

  hasError(formName: 'update' | 'address', controlName: string, errorType: string): boolean {
    const control = this.getFormControl(formName, controlName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
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