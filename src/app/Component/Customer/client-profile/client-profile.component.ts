import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientProfileService } from '../../Customer/services/client-profile.service';
import {
  ClientProfile,
  ApiResponse,
  UpdateClientProfileRequest,
  AddAddressRequest,
  Address, 
  AddAddressResponse
} from '../../../../app/core/models/ClientProfile.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {

  clientProfile: ClientProfile | null = null;
  isLoading = false;
  isUpdating = false;
  isAddingAddress = false;
  isEditAddressMode = false; 
  isSettingDefault = false; 
  isDeletingAddress = false; 
  error: string | null = null;
  successMessage: string | null = null;
  clientId!: number;

  isEditMode = false;
  editForm: UpdateClientProfileRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  showAddressModal = false;
  addressForm: AddAddressRequest = {
    userId: 0,
    address1: '',
    city: '',
    latitude: 0,
    longitude: 0,
    addressType: 'Home',
    isDefault: false,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  currentEditingAddressId: number | null = null; 

  constructor(
    private clientProfileService: ClientProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        const parsedId = parseInt(id, 10);

        if (!isNaN(parsedId)) {
          this.clientId = parsedId;
          localStorage.setItem('clientId', parsedId.toString());
          this.loadClientProfile();
        } else {
          this.clientId = 72;
          localStorage.setItem('clientId', '72');
          this.loadClientProfile();
        }
      } else {
        console.log('No client ID found in route parameters');

        const storedId = localStorage.getItem('clientId');
        if (storedId) {
          this.clientId = parseInt(storedId, 10);
        } else {
          this.clientId = 72;
          localStorage.setItem('clientId', '72');
        }
        this.loadClientProfile();
      }
    });
  }

  loadClientProfile(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.clientProfileService.getClientProfile(this.clientId!)
      .subscribe({
        next: (response: ApiResponse<ClientProfile>) => {
          if (response.isSuccess) {
            this.clientProfile = response.data;

            if (!this.clientProfile.addresses) {
              this.clientProfile.addresses = []; 
            }

            
            if (this.clientProfile.defaultAddress) {
              const apiDefaultAddress = { ...this.clientProfile.defaultAddress, isDefault: true };
              const found = this.clientProfile.addresses.some(
                addr => addr.id === apiDefaultAddress.id
              );

              if (!found) {
                this.clientProfile.addresses.push(apiDefaultAddress as Address); 
              }

              this.clientProfile.addresses.forEach(addr => {
                if (addr.id === apiDefaultAddress.id) {
                  addr.isDefault = true;
                } else {
                  addr.isDefault = false;
                }
              });
              this.clientProfile.defaultAddress = apiDefaultAddress as Address; 
            } else {
                
                this.clientProfile.addresses.forEach(addr => addr.isDefault = false);
                this.clientProfile.defaultAddress = null; 
            }

          }
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load client profile';
          this.isLoading = false;
          console.error('Error loading client profile:', error);
        }
      });
  }

  initializeEditForm(): void {
    if (this.clientProfile) {
      this.editForm = {
        firstName: this.clientProfile.firstName,
        lastName: this.clientProfile.lastName,
        email: this.clientProfile.email,
        phone: this.clientProfile.phone
      };
    }
  }

  onEditProfile(): void {
    this.isEditMode = true;
    this.error = null;
    this.successMessage = null;
    this.initializeEditForm();
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.error = null;
    this.successMessage = null;
    this.initializeEditForm();
  }

  onSaveProfile(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isUpdating = true;
    this.error = null;
    this.successMessage = null;

    this.clientProfileService.updateClientProfile(this.clientId!, this.editForm)
      .subscribe({
        next: (response: ApiResponse<null>) => {
          if (response.isSuccess) {
            this.successMessage = 'Profile updated successfully!';
            this.isEditMode = false;
            this.updateLocalProfile();
          } else {
            this.error = response.message || 'Failed to update profile';
          }
          this.isUpdating = false;
        },
        error: (error) => {
          this.error = 'Failed to update profile. Please try again.';
          this.isUpdating = false;
          console.error('Error updating profile:', error);
        }
      });
  }

  private updateLocalProfile(): void {
    if (this.clientProfile) {
      this.clientProfile.firstName = this.editForm.firstName || this.clientProfile.firstName;
      this.clientProfile.lastName = this.editForm.lastName || this.clientProfile.lastName;
      this.clientProfile.email = this.editForm.email || this.clientProfile.email;
      this.clientProfile.phone = this.editForm.phone || this.clientProfile.phone;
      this.clientProfile.fullName = `${this.clientProfile.firstName} ${this.clientProfile.lastName}`;
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.editForm.firstName?.trim() &&
      this.editForm.lastName?.trim() &&
      this.editForm.email?.trim() &&
      this.editForm.phone?.trim()
    );
  }

  onAddAddress(): void {
    this.isEditAddressMode = false; 
    this.showAddressModal = true;
    this.error = null;
    this.successMessage = null;
    this.initializeAddressForm();
  }

  initializeAddressForm(): void {
    this.addressForm = {
      userId: this.clientId,
      address1: '',
      city: '',
      latitude: 0,
      longitude: 0,
      addressType: 'Home',
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.currentEditingAddressId = null; 
  }

  onCancelAddAddress(): void {
    this.showAddressModal = false;
    this.error = null;
    this.successMessage = null;
    this.initializeAddressForm();
  }

  onSaveAddress(): void {
    if (!this.isAddressFormValid()) {
      this.error = 'Please fill in all required address fields';
      return;
    }

    this.isAddingAddress = true;
    this.error = null;
    this.successMessage = null;

    this.clientProfileService.addAddress(this.addressForm)
      .subscribe({
        next: (response: ApiResponse<AddAddressResponse>) => { 
          if (response.isSuccess && response.data && response.data.address) { 
            this.successMessage = 'Address added successfully!';

            if (this.clientProfile) {
                const newAddress: Address = response.data.address; 

                if (!this.clientProfile.addresses) {
                    this.clientProfile.addresses = [];
                }

                if (newAddress.isDefault) {
                    this.clientProfile.addresses.forEach(addr => addr.isDefault = false);
                    this.clientProfile.defaultAddress = newAddress;
                } else if (!this.clientProfile.defaultAddress && this.clientProfile.addresses.length === 0) {
                  if (this.clientProfile.addresses.length === 0) {
                    newAddress.isDefault = true;
                    this.clientProfile.defaultAddress = newAddress;
                  }
                }

                this.clientProfile.addresses.push(newAddress); 
                this.clientProfile.addresses.sort((a, b) => {
                  if (a.isDefault && !b.isDefault) return -1;
                  if (!a.isDefault && b.isDefault) return 1;
                  return 0;
                });
            }

            this.showAddressModal = false;
            this.initializeAddressForm();

          } else {
            this.error = response.message || 'Failed to add address';
          }
          this.isAddingAddress = false;
        },
        error: (error) => {
          this.error = 'Failed to add address. Please try again.';
          this.isAddingAddress = false;
          console.error('Error adding address:', error);
        }
      });
  }

  onEditAddress(address: Address): void {
    this.isEditAddressMode = true;
    this.showAddressModal = true;
    this.error = null;
    this.successMessage = null;
    this.currentEditingAddressId = address.id;
    this.addressForm = {
      userId: address.userId,
      address1: address.address,
      city: address.city,
      latitude: address.latitude,
      longitude: address.longitude,
      addressType: address.addressType,
      isDefault: address.isDefault,
      isActive: address.isActive,
      createdAt: address.createdAt
    };
  }

  onUpdateAddress(): void {
    if (!this.isAddressFormValid()) {
      this.error = 'Please fill in all required address fields';
      return;
    }
    if (this.currentEditingAddressId === null) {
      this.error = 'No address selected for editing.';
      return;
    }

    this.isAddingAddress = true;
    this.error = null;
    this.successMessage = null;

    setTimeout(() => {
      if (this.clientProfile && this.clientProfile.addresses) {
        const index = this.clientProfile.addresses.findIndex(addr => addr.id === this.currentEditingAddressId);
        if (index > -1) {
          const updatedAddress: Address = {
            ...this.clientProfile.addresses[index],
            address: this.addressForm.address1,
            city: this.addressForm.city,
            latitude: this.addressForm.latitude,
            longitude: this.addressForm.longitude,
            addressType: this.addressForm.addressType,
            isDefault: this.addressForm.isDefault,
            updatedAt: new Date().toISOString()
          };

          if (updatedAddress.isDefault) {
            this.clientProfile.addresses.forEach(addr => {
              if (addr.id !== updatedAddress.id) {
                addr.isDefault = false;
              }
            });
            this.clientProfile.defaultAddress = updatedAddress;
          } else if (this.clientProfile.defaultAddress && this.clientProfile.defaultAddress.id === updatedAddress.id) {
             this.clientProfile.defaultAddress = null;
             if (this.clientProfile.addresses.length > 1) {
                const otherAddresses = this.clientProfile.addresses.filter(addr => addr.id !== updatedAddress.id);
                if (otherAddresses.length > 0) {
                    otherAddresses[0].isDefault = true;
                    this.clientProfile.defaultAddress = otherAddresses[0];
                }
             }
          }

          this.clientProfile.addresses[index] = updatedAddress;
          this.successMessage = 'Address updated successfully!';
          this.showAddressModal = false;
          this.initializeAddressForm();
        } else {
          this.error = 'Address not found for update.';
        }
      } else {
        this.error = 'Client profile or addresses not loaded. Cannot update address.';
      }
      this.isAddingAddress = false;
    }, 500);
  }

  onDeleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.isDeletingAddress = true;
      this.error = null;
      this.successMessage = null;

      setTimeout(() => {
        if (this.clientProfile && this.clientProfile.addresses) {
          const initialLength = this.clientProfile.addresses.length;
          this.clientProfile.addresses = this.clientProfile.addresses.filter(addr => addr.id !== addressId);

          if (this.clientProfile.addresses.length < initialLength) {
            if (this.clientProfile.defaultAddress && this.clientProfile.defaultAddress.id === addressId) {
              this.clientProfile.defaultAddress = null;
              if (this.clientProfile.addresses.length > 0) {
                this.clientProfile.addresses[0].isDefault = true;
                this.clientProfile.defaultAddress = this.clientProfile.addresses[0];
              }
            }
            this.successMessage = 'Address deleted successfully!';
          } else {
            this.error = 'Address not found for deletion.';
          }
        } else {
          this.error = 'Client profile or addresses not loaded. Cannot delete address.';
        }
        this.isDeletingAddress = false;
      }, 500);
    }
  }

  onSetDefaultAddress(address: Address): void {
    this.isSettingDefault = true;
    this.error = null;
    this.successMessage = null;

    setTimeout(() => {
      if (this.clientProfile && this.clientProfile.addresses) {
        this.clientProfile.addresses.forEach(addr => {
          if (addr.id === address.id) {
            addr.isDefault = true;
          } else {
            addr.isDefault = false;
          }
        });
        this.clientProfile.defaultAddress = address;
        this.successMessage = `Address "${address.addressType}" set as default!`;
      } else {
        this.error = 'Client profile or addresses not loaded. Cannot set default address.';
      }
      this.isSettingDefault = false;
    }, 500);
  }

  private isAddressFormValid(): boolean {
    return !!(
      this.addressForm.address1?.trim() &&
      this.addressForm.city?.trim() &&
      this.addressForm.addressType?.trim()
    );
  }

  private generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 10000);
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.addressForm.latitude = position.coords.latitude;
          this.addressForm.longitude = position.coords.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
          this.error = 'Unable to retrieve your current location.';
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.error = 'Geolocation is not supported by your browser.';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}