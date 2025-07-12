import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientProfileService } from '../services/client-profile.service';
import { AddressService } from '../services/address.service';
import { forkJoin, Observable } from 'rxjs';
import { 
  ClientProfile, 
  UpdateClientProfileRequest, 
  ApiResponse,
  Address
} from '../../../core/models/ClientProfile.model';
import { AddressDTO, CreateAddressDTO } from '../../../core/models/Address.model';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-client-profile',
  imports: [CommonModule, ReactiveFormsModule],
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
  processingAddressId: number | null = null;

  updateProfileForm!: FormGroup;
  addAddressForm!: FormGroup;

  clientId: number = 0;
  loadingLocation = false;
  locationError: string | null = null;

  constructor(
    private clientProfileService: ClientProfileService,
    private addressService: AddressService,
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
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
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      addressType: ['Home', Validators.required]
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
        console.log('Load profile response:', response);
        
        if (response.isSuccess && response.data) {
          // Force a complete refresh of the profile data
          this.clientProfile = { 
            ...response.data,
            addresses: response.data.addresses || []
          };
          
          console.log('Updated client profile:', this.clientProfile);
          console.log('Default address:', this.clientProfile.defaultAddress);
          
          // Update form with current data if modal is open
          if (this.showUpdateForm) {
            this.populateUpdateForm();
          }
          
          this.cdr.detectChanges();
        } else {
          this.error = response.message || 'Failed to load client profile';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Load profile error:', error);
        this.error = error.error?.message || 'An error occurred while loading the profile';
        this.loading = false;
      }
    });
  }

  getAddresses(): void {
    this.addressService.GetAddressesByUserId(this.clientId).subscribe({
      next: (addresses: AddressDTO[]) => {
        console.log('Get addresses response:', addresses);
        this.addresses = [...(addresses || [])]; // Force array refresh
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Get addresses error:', error);
        this.error = error.error?.message || 'Failed to load addresses';
        this.addresses = [];
      }
    });
  }

  getCurrentLocation(form: 'update' | 'add'): void {
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

        if (form === 'update') {
          this.updateProfileForm.patchValue({
            latitude: latitude,
            longitude: longitude
          });
        } else {
          this.addAddressForm.patchValue({
            latitude: latitude,
            longitude: longitude
          });
        }
        
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

  // Helper method to get address string from either Address or AddressDTO
  private getAddressString(address: Address | AddressDTO): string {
    if ('address' in address) {
      // This is an Address type
      return address.address || '';
    } else {
      // This is an AddressDTO type
      return address.address1 || '';
    }
  }

  // FIXED: Enhanced method to properly populate the update form with default address data
  private populateUpdateForm(): void {
    if (!this.clientProfile) {
      console.log('No client profile available for form population');
      return;
    }

    console.log('Populating update form with profile data:', this.clientProfile);
    
    // Get the default address - could be from multiple sources
    let defaultAddress: Address | AddressDTO | null = null;
    
    // First, try to get from clientProfile.defaultAddress
    if (this.clientProfile.defaultAddress) {
      defaultAddress = this.clientProfile.defaultAddress;
      console.log('Using defaultAddress from clientProfile:', defaultAddress);
    }
    // If not found, try to find default address from addresses array
    else if (this.addresses && this.addresses.length > 0) {
      defaultAddress = this.addresses.find(addr => addr.isDefault) || null;
      console.log('Using default address from addresses array:', defaultAddress);
    }
    // If still not found, use the first address if available
    else if (this.addresses && this.addresses.length > 0) {
      defaultAddress = this.addresses[0];
      console.log('Using first available address:', defaultAddress);
    }

    // Populate the form with client profile data and default address
    const formData = {
      firstName: this.clientProfile.firstName || '',
      lastName: this.clientProfile.lastName || '',
      email: this.clientProfile.email || '',
      phone: this.clientProfile.phone || '',
      // Address fields - handle different possible property names
      address: defaultAddress ? this.getAddressString(defaultAddress) : '',
      city: defaultAddress ? (defaultAddress.city || '') : '',
      latitude: defaultAddress ? (defaultAddress.latitude || '') : '',
      longitude: defaultAddress ? (defaultAddress.longitude || '') : '',
      addressType: defaultAddress ? (defaultAddress.addressType || 'Home') : 'Home'
    };

    console.log('Form data being set:', formData);
    
    this.updateProfileForm.patchValue(formData);
    
    // Mark form as pristine after population
    this.updateProfileForm.markAsPristine();
    
    // Trigger change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.error = null;
    this.successMessage = null;
    this.locationError = null;
    this.loadingLocation = false;

    if (this.showUpdateForm) {
      console.log('Opening update form modal');
      // Populate form immediately when opening
      this.populateUpdateForm();
    } else {
      // Reset form when closing
      this.updateProfileForm.reset();
    }
  }

onUpdateProfile(): void {
  if (this.updateProfileForm.valid && !this.loading) {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.updateProfileForm.value;
    
    const updateData: UpdateClientProfileRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      address: {
        address1: formValue.address,
        city: formValue.city,
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude),
        addressType: formValue.addressType
      }
    };

    console.log('Update profile data:', updateData);

    this.clientProfileService.updateClientProfile(this.clientId, updateData).subscribe({
      next: (response) => {
        console.log('Update profile response:', response);
        
        if (response.isSuccess) {
          this.successMessage = 'Profile updated successfully!';
          this.showUpdateForm = false;
          this.loading = false;
          
          // ENHANCED: Multiple refresh strategy with progressive delays
          this.performProgressiveRefresh();
        } else {
          this.error = response.message || 'Failed to update profile';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Update profile error:', error);
        this.error = error.error?.message || 'An error occurred while updating the profile';
        this.loading = false;
      }
    });
  } else {
    Object.keys(this.updateProfileForm.controls).forEach(key => {
      this.updateProfileForm.get(key)?.markAsTouched();
    });
  }
}

private performProgressiveRefresh(): void {
  console.log('Starting progressive refresh strategy...');
  
  // Immediate refresh (for basic profile data)
  this.refreshDataWithRetry(0);
  
  // Second refresh after 1 second (for address data)
  setTimeout(() => {
    this.refreshDataWithRetry(1);
  }, 1000);
  
  // Third refresh after 3 seconds (final sync)
  setTimeout(() => {
    this.refreshDataWithRetry(2);
  }, 3000);
}

private refreshDataWithRetry(attemptNumber: number): void {
  console.log(`Refresh attempt ${attemptNumber + 1}/3`);
  
  forkJoin({
    profile: this.clientProfileService.getClientProfile(this.clientId),
    addresses: this.addressService.GetAddressesByUserId(this.clientId)
  }).subscribe({
    next: (results) => {
      console.log(`Refresh attempt ${attemptNumber + 1} results:`, results);
      
      let hasChanges = false;
      
      // Update profile with change detection
      if (results.profile.isSuccess && results.profile.data) {
        const newProfile = { 
          userId: results.profile.data.userId,
          firstName: results.profile.data.firstName,
          lastName: results.profile.data.lastName,
          email: results.profile.data.email,
          phone: results.profile.data.phone,
          isActive: results.profile.data.isActive,
          createdAt: results.profile.data.createdAt,
          updatedAt: results.profile.data.updatedAt,
          addresses: results.profile.data.addresses || [],
          defaultAddress: results.profile.data.defaultAddress
        };
        
        // Check if there are actual changes
        if (JSON.stringify(this.clientProfile) !== JSON.stringify(newProfile)) {
          this.clientProfile = newProfile;
          hasChanges = true;
          console.log(`Profile data changed in attempt ${attemptNumber + 1}:`, this.clientProfile);
        }
      }
      
      // Update addresses with change detection
      const newAddresses = results.addresses ? [...results.addresses] : [];
      if (JSON.stringify(this.addresses) !== JSON.stringify(newAddresses)) {
        this.addresses = newAddresses;
        hasChanges = true;
        console.log(`Addresses changed in attempt ${attemptNumber + 1}:`, this.addresses);
      }
      
      if (hasChanges) {
        // Force comprehensive change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        
        // Additional async change detection
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 50);
        
        console.log(`Data refresh ${attemptNumber + 1} completed with changes`);
      } else {
        console.log(`No changes detected in refresh attempt ${attemptNumber + 1}`);
      }
    },
    error: (error) => {
      console.error(`Error in refresh attempt ${attemptNumber + 1}:`, error);
      
      // Only show error on final attempt
      if (attemptNumber === 2) {
        this.error = 'Failed to refresh data. Please reload the page.';
      }
    }
  });
}

private forceDataRefresh(): void {
  console.log('Force refreshing all data...');
  
  // Set loading state for visual feedback
  this.loading = true;
  
  // Clear any existing messages
  this.error = null;
  this.successMessage = null;
  
  // Use forkJoin to refresh both profile and addresses simultaneously
  forkJoin({
    profile: this.clientProfileService.getClientProfile(this.clientId),
    addresses: this.addressService.GetAddressesByUserId(this.clientId)
  }).subscribe({
    next: (results) => {
      console.log('Force refresh results:', results);
      
      // Update profile with complete data reset
      if (results.profile.isSuccess && results.profile.data) {
        // Create a completely new object to ensure change detection
        this.clientProfile = { 
          userId: results.profile.data.userId,
          firstName: results.profile.data.firstName,
          lastName: results.profile.data.lastName,
          email: results.profile.data.email,
          phone: results.profile.data.phone,
          isActive: results.profile.data.isActive,
          createdAt: results.profile.data.createdAt,
          updatedAt: results.profile.data.updatedAt,
          addresses: results.profile.data.addresses || [],
          defaultAddress: results.profile.data.defaultAddress
        };
        console.log('Profile force refreshed:', this.clientProfile);
      }
      
      // Update addresses with complete data reset
      this.addresses = results.addresses ? [...results.addresses] : [];
      console.log('Addresses force refreshed:', this.addresses);
      
      // Show success message after refresh
      this.successMessage = 'Profile and address data updated successfully!';
      
      // Force comprehensive change detection
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      
      // Multiple async change detection cycles
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
      
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 300);
      
      this.loading = false;
      console.log('Force data refresh completed successfully');
    },
    error: (error) => {
      console.error('Error in force refresh:', error);
      this.error = 'Failed to refresh data. Please reload the page.';
      this.loading = false;
    }
  });
}

// NEW: Method to manually trigger UI refresh
refreshUI(): void {
  console.log('Manually refreshing UI...');
  this.cdr.markForCheck();
  this.cdr.detectChanges();
  
  // Force re-render after a small delay
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 100);
}

// isProfileDataLoaded(): boolean {
//   return this.clientProfile && 
//          this.clientProfile.userId > 0 && 
//          this.clientProfile.firstName && 
//          this.clientProfile.lastName;
// }

// NEW: Get current default address with better error handling
getCurrentDefaultAddress(): AddressDTO | Address | null {
  // First check the profile's default address
  if (this.clientProfile?.defaultAddress) {
    return this.clientProfile.defaultAddress;
  }
  
  // Then check the addresses array for a default address
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddr = this.addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      return defaultAddr;
    }
  }
  
  // Return null if no default address found
  return null;
}

// NEW: Method to check if address data is stale
isAddressDataStale(): boolean {
  const currentDefault = this.getCurrentDefaultAddress();
  const profileDefault = this.clientProfile?.defaultAddress;
  
  // If profile shows no default address but we have addresses, data might be stale
  return !profileDefault && this.addresses && this.addresses.length > 0;
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
        if (response.isSuccess) {
          this.successMessage = 'Address added successfully!';
          this.showAddressForm = false;
          this.loading = false;
          
          // Reset form
          this.addAddressForm.reset({
            addressType: 'Home',
            isDefault: false,
            isActive: true
          });
          
          // Force immediate and complete data refresh
          setTimeout(() => {
            this.forceDataRefresh();
          }, 300);
        } else {
          this.error = response.message || 'Failed to add address';
          this.loading = false;
        }
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
  }
}

  // Use the SetDefaultAddress endpoint directly
  setDefaultAddress(addressId: number): void {
  if (this.loading) return;
  
  this.loading = true;
  this.error = null;
  this.successMessage = null;
  this.processingAddressId = addressId;

  console.log(`Setting address ${addressId} as default for user ${this.clientId}`);

  this.addressService.SetDefaultAddress(addressId, this.clientId).subscribe({
    next: (response) => {
      console.log('Set default address response:', response);
      
      if (response.isSuccess) {
        this.successMessage = 'Default address updated successfully!';
        this.loading = false;
        this.processingAddressId = null;
        
        // Force immediate and complete data refresh
        setTimeout(() => {
          this.forceDataRefresh();
        }, 300);
      } else {
        this.error = response.message || 'Failed to set default address';
        this.loading = false;
        this.processingAddressId = null;
      }
    },
    error: (error) => {
      console.error('Error setting default address:', error);
      this.error = error.error?.message || 'An error occurred while setting the default address';
      this.loading = false;
      this.processingAddressId = null;
    }
  });
}

refreshAllData(): void {
  console.log('Manual refresh triggered');
  this.forceDataRefresh();
}

// ENHANCED: Method to check if data is being refreshed
isDataRefreshing(): boolean {
  return this.loading;
}

  
  // private refreshData(): void {
  //   console.log('Refreshing data...');
    
  //   // Use forkJoin to refresh both profile and addresses simultaneously
  //   forkJoin({
  //     profile: this.clientProfileService.getClientProfile(this.clientId),
  //     addresses: this.addressService.GetAddressesByUserId(this.clientId)
  //   }).subscribe({
  //     next: (results) => {
  //       console.log('Refresh results:', results);
        
  //       // Update profile
  //       if (results.profile.isSuccess && results.profile.data) {
  //         this.clientProfile = { 
  //           ...results.profile.data,
  //           addresses: results.profile.data.addresses || []
  //         };
  //         console.log('Profile refreshed:', this.clientProfile);
  //       }
        
  //       // Update addresses
  //       this.addresses = [...(results.addresses || [])];
  //       console.log('Addresses refreshed:', this.addresses);
        
  //       // If update form is open, refresh it with new data
  //       if (this.showUpdateForm) {
  //         this.populateUpdateForm();
  //       }
        
  //       // Force change detection
  //       this.cdr.detectChanges();
        
  //       console.log('Data refreshed successfully');
  //     },
  //     error: (error) => {
  //       console.error('Error refreshing data:', error);
  //       // Don't show error to user as this is a background refresh
  //     }
  //   });
  // }

  // Helper method to check if an address is being processed
  isAddressBeingProcessed(addressId: number): boolean {
    return this.processingAddressId === addressId;
  }

  isAnyAddressBeingProcessed(): boolean {
    return this.processingAddressId !== null;
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