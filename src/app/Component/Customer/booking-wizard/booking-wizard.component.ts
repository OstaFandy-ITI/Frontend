import { CreateAddressDTO } from './../../../core/models/Address.model';
import { AddressService } from './../services/address.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoggedInUser } from '../../../core/models/user.model';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/Booking.service';
import { ChatComponent } from '../chat/chat.component';
import { ServiceService } from '../../Customer/services/service.service';
import { ServiceItem } from '../../../core/models/service.models';
import { CreateBookingVM, slots } from '../../../core/models/Booking.model';
import { AddressDTO } from '../../../core/models/Address.model';
import { ToastrService } from 'ngx-toastr';
import { AddressTypes } from '../../../core/Shared/Enum';

@Component({
  selector: 'app-booking-wizard',
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css'],
  standalone: true,

  imports: [FormsModule, CommonModule, ChatComponent, ReactiveFormsModule],
})
export class BookingWizardComponent implements OnInit {
  currentStep = 1;
  chatVisible = false;
  selectedPayment = 'card';
  services = [{ category: '', type: '', description: '' }];
  userId!: number;
  currentUser!: LoggedInUser | null;
  today!: string;

  constructor(
    private authService: AuthService,
    private BookingService: BookingService,
    private serviceService: ServiceService,
    private addressService: AddressService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.addressForm = this.fb.group({
      address1: ['', Validators.required],
      city: ['', Validators.required],
      addressType: ['Home', Validators.required],
      isDefault: [false],
      latitude: [null],
      longitude: [null],
    });
  }

  ngOnInit(): void {
    this.authService.CurrentUser$.subscribe((user) => {
      if (!user) return;
      this.currentUser = user;
      this.userId = Number(user?.NameIdentifier);
      console.log('✅ userId:', this.userId);
      console.log('✅ currentUser:', this.currentUser);
   

    });

    //step1
    this.Getservices(4); //  ==> take catogery id later
    const saved = localStorage.getItem('selectedServices');
    if (saved) {
      this.SelectedItem = JSON.parse(saved);
    }

    //step2
    this.GetAddressesByUserId();

    //step3
    const now = new Date();
    this.today = now.toISOString().split('T')[0];

    //booking
    const savedBooking = localStorage.getItem('bookingData');
    if (savedBooking) {
      this.bookingData = JSON.parse(savedBooking);
    }
  }

  //#region Navigation
  goToStep(step: number): void {
    this.updateStepData(this.currentStep);
    if (step >= 1 && step <= 5) {
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  next(): void {
    this.updateStepData(this.currentStep);
    if (this.currentStep < 5) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  back(): void {
    this.updateStepData(this.currentStep);
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  getStepLabel(step: number): string {
    return ['Services', 'Location', 'Schedule', 'Checkout', 'Confirm'][step - 1];
  }

  getStepIcon(step: number): string {
    return [
      'bi bi-tools',
      'bi bi-geo-alt',
      'bi bi-calendar2-week',
      'bi bi-wallet2',
      'bi bi-check-circle',
    ][step - 1];
  }

  selectPayment(method: 'card' | 'cash') {
    this.selectedPayment = method;
  }

  //#endregion

  //#region step 1
  ServicesItem: ServiceItem[] = [];
  SelectedItem: Array<ServiceItem & { quantity: number }> = [];

  Getservices(categoryId: number) {
    this.serviceService.GetServiceByCategoryId(categoryId).subscribe({
      next: (response) => {
        this.ServicesItem = response;
        console.log(this.ServicesItem);
      },
    });
  }

  addService(item: ServiceItem) {
    const found = this.SelectedItem.find((s) => s.id === item.id);
    if (found) {
      found.quantity++;
    } else {
      this.SelectedItem.push({
        ...item,
        quantity: 1,
      });
    }
    this.saveSelectedItems();
  }

  removeService(id: number) {
    this.SelectedItem = this.SelectedItem.filter((item) => item.id !== id);
    this.saveSelectedItems();
  }

  saveSelectedItems() {
    localStorage.setItem('selectedServices', JSON.stringify(this.SelectedItem));
  }

  //#endregion
  //#region step2
  userAddresses: AddressDTO[] = [];
  AddressTypes = Object.values(AddressTypes);
  addressForm!: FormGroup;
  cites: string[] = ['Cairo', 'Alexandria', 'Mansoura'];

  selectedAddressId!: number;
  GetAddressesByUserId() {
    this.addressService.GetAddressesByUserId(this.userId).subscribe({
      next: (response) => {
        this.userAddresses = response;
        const defaultAddress = this.userAddresses.find(
          (a) => a.isDefault == true
        );
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
          this.bookingData.addressId = defaultAddress.id;
        }

        console.log(this.userAddresses);
      },
      error: (err) => {
        this.toastr.error(err.error.message);
      },
    });
  }

  selectedAdddress(AddressId: number) {
    this.selectedAddressId = AddressId;
    this.bookingData.addressId = AddressId;
  }

  //add address

  //get location coordinates
  getLocationCoordinates() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.addressForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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

  submitNewAddress() {
    if (this.addressForm.invalid) {
      this.toastr.error('Please fill the required fields');
      return;
    }

    const newAddress: CreateAddressDTO = {
      userId: this.userId,
      address1: this.addressForm.value.address1,
      city: this.addressForm.value.city,
      addressType: this.addressForm.value.addressType,
      isDefault: this.addressForm.value.isDefault,
      latitude: this.addressForm.value.latitude,
      longitude: this.addressForm.value.longitude,
      isActive: true,
      createdAt: new Date(),
    };

    this.addressService.CreateAddress(newAddress).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Address added');

        this.GetAddressesByUserId();

        this.addressForm.reset({
          addressType: 'Home',
          isDefault: false,
        });
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Error adding address');
      },
    });
  }

  //#endregion

  //#region step3
  preferredDate: string = '';
  availableSlots: slots[] = [];
  selectedSlot!: slots;

  
  onDateChange() {
    const selectedAddress = this.userAddresses.find(
      (a) => a.id === this.selectedAddressId
    );

    const estimatedMinutes = this.bookingData.estimatedMinutes;
    const day = new Date(this.preferredDate).toISOString();

    // temp
    const categoryId = 4;

    this.BookingService.getFreeSlot(
      categoryId,
      day,
      selectedAddress!.latitude!,
      selectedAddress!.longitude!,
      estimatedMinutes!
    ).subscribe({
      next: (slots) => {
        if (slots.data) {
          this.availableSlots = slots.data;
        } else {
          this.availableSlots;
          this.toastr.warning('No slots available for this date.');
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Error fetching slots');
      },
    });
  }

  //#endregion
  //#region Booking
  bookingData: CreateBookingVM = new CreateBookingVM();

  updateStepData(step: number): void {
    // Step 1: Services
    if (step === 1) {
      this.bookingData.clientId = this.userId;
      this.bookingData.serviceDto = this.SelectedItem.map((item) => ({
        serviceId: item.id,
        quantity: item.quantity,
      }));
      this.bookingData.totalPrice = this.SelectedItem.reduce(
        (sum, item) => sum + (item.fixedPrice || 0) * item.quantity,
        0
      );

      this.bookingData.estimatedMinutes = this.SelectedItem.reduce(
        (sum, item) => sum + (item.estimatedMinutes || 0) * item.quantity,
        0
      );
    }

    // Step 2: Location
    // if (step === 2) {
    // }

    // Step 3: Schedule
    if (step === 3) {
      if (!this.selectedSlot) {
        this.toastr.warning(
          'Please select a preferred time slot before proceeding.'
        );
      }
      this.bookingData.handymanId = this.selectedSlot.userId;
      this.bookingData.preferredDate = this.selectedSlot.startTime;
    }

    // Step 4: Payment
    if (step === 4) {
    }

    //Step 5: Save Data
    localStorage.setItem('bookingData', JSON.stringify(this.bookingData));
    console.log(this.bookingData);
  }

  //#endregion
}
