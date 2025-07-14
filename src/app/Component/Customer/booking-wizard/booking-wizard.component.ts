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
import { ActivatedRoute, Router } from '@angular/router';
import { Stripe } from '@stripe/stripe-js';
import { PaymentService } from '../services/payment.service';
import { HandymanService } from '../../Admin/services/handyman.service';
import { AdminHandyManDTO } from '../../../core/models/Adminhandyman.model';
import { NavbarComponent } from '../Layout/navbar/navbar.component';
import { FooterComponent } from '../Layout/footer/footer.component';

@Component({
  selector: 'app-booking-wizard',
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ChatComponent,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
  ],
})
export class BookingWizardComponent implements OnInit {
  currentStep = 1;
  chatVisible = false;
  selectedPayment = 'card';
  services = [{ category: '', type: '', description: '' }];
  userId!: number;
  currentUser!: LoggedInUser | null;
  today!: string;
  cashConfirmed: boolean = false;
  categoryId: any;

  constructor(
    private authService: AuthService,
    private BookingService: BookingService,
    private serviceService: ServiceService,
    private addressService: AddressService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private handyManService: HandymanService,
    private route: ActivatedRoute,
    private router: Router
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
    // Step 0: Check logged-in user
    this.authService.CurrentUser$.subscribe((user) => {
      if (!user) return;
      this.currentUser = user;
      this.userId = Number(user?.NameIdentifier);
    });

    // Step 1: Load categoryId from query params
    this.route.queryParams.subscribe((params) => {
      const categoryId = +params['categoryId'] || 0;

      this.categoryId = categoryId;
      this.Getservices(this.categoryId);
    });
    // Step 1.5: Load selected services from localStorage
    const saved = localStorage.getItem('selectedServices');
    if (saved) {
      this.SelectedItem = JSON.parse(saved);
    }

    // Step 2: Load user's saved addresses
    this.GetAddressesByUserId();

    // Step 3: Set today's date for min date selection
    const now = new Date();
    this.today = now.toISOString().split('T')[0];

    // Step 4: Load existing booking draft if exists
    const savedBooking = localStorage.getItem('bookingData');
    if (savedBooking) {
      this.bookingData = JSON.parse(savedBooking);
    }
  }

  goToStep(step: number): void {
    this.updateStepData(this.currentStep);

    // ✅ Prevent going to step 5 without a valid chatId
    if (step === 5 && !this.chatId) {
      this.toastr.warning(
        'Please Complete the booking process before confirming.'
      );
      return;
    }

    if (step >= 1 && step <= 5) {
      this.currentStep = step;
      window.scrollTo(0, 0);
      this.initializeStripeIfNeeded();
    }
  }
  next(): void {
    this.updateStepData(this.currentStep);
    if (this.currentStep < 5) {
      this.currentStep++;
      window.scrollTo(0, 0);

      this.initializeStripeIfNeeded();
    }
  }

  back(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);

      this.initializeStripeIfNeeded();
    }
  }

  getStepLabel(step: number): string {
    return ['Services', 'Location', 'Schedule', 'Checkout', 'Confirm'][
      step - 1
    ];
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

    this.initializeStripeIfNeeded();
  }

  //#endregion

  //#region step 1
  ServicesItem: ServiceItem[] = [];
  SelectedItem: Array<ServiceItem & { quantity: number }> = [];

  Getservices(categoryId: number) {
    this.serviceService.GetServiceByCategoryId(categoryId).subscribe({
      next: (response) => {
        this.ServicesItem = response;
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

    const categoryId = this.categoryId;
    console.log('categoryId:', categoryId);
    console.log(this.categoryId);
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
        this.availableSlots = [];
        this.toastr.error(err.error.message || 'Error fetching slots');
      },
    });
  }

  //#endregion
  //#region step4
  stripe: Stripe | null = null;
  cardNumberElement: any;
  cardExpiryElement: any;
  cardCvcElement: any;

  async initStripe() {
    this.stripe = await this.paymentService.stripePromise;
    if (!this.stripe) {
      this.toastr.error('Stripe failed to load');
      return;
    }

    const elements = this.stripe.elements();

    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px',
        borderRadius: '6px',
        backgroundColor: '#f6f9fc',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };
    this.cardNumberElement = elements.create('cardNumber', { style });
    this.cardExpiryElement = elements.create('cardExpiry', { style });
    this.cardCvcElement = elements.create('cardCvc', { style });

    this.cardNumberElement.mount('#card-number-element');
    this.cardExpiryElement.mount('#card-expiry-element');
    this.cardCvcElement.mount('#card-cvc-element');

    const displayError = document.getElementById('card-errors');
    const onChangeHandler = (event: any) => {
      if (displayError) {
        displayError.textContent = event.error ? event.error.message : '';
      }
    };

    this.cardNumberElement.on('change', onChangeHandler);
    this.cardExpiryElement.on('change', onChangeHandler);
    this.cardCvcElement.on('change', onChangeHandler);
  }

  initializeStripeIfNeeded() {
    if (this.currentStep === 4 && this.selectedPayment === 'card') {
      setTimeout(() => {
        this.initStripe();
      }, 0);
    }
  }

  //confirm payment
  async confirmCardPayment() {
    if (this.selectedSlot == null) {
      this.toastr.warning('Kindly choose a time slot to continue.');
      return;
    }
    this.isLoading = true;
    if (this.selectedPayment === 'card') {
      if (!this.stripe || !this.cardNumberElement) {
        this.toastr.error('Stripe is not initialized.');
        return;
      }
      const amount = this.bookingData.totalPrice;
      if (amount === undefined) {
        this.toastr.error('Please select at least one service.');
        return;
      }

      this.paymentService.CreatePaymentIntent(amount).subscribe({
        next: async (res) => {
          const clientSecret = res.clientSecret;
          // stripe confirm
          const { error, paymentIntent } =
            await this.stripe!.confirmCardPayment(clientSecret, {
              payment_method: {
                card: this.cardNumberElement,
              },
            });

          if (error) {
            this.toastr.error(error.message || 'Payment failed.');
            this.isLoading = false;
          } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            this.bookingData.paymentStatus = 'Paid';
            this.bookingData.amount = amount;
            this.bookingData.method = 'stripe';
            this.bookingData.paymentIntentId = paymentIntent.id;
            this.toastr.success('Payment successful');

            console.log(this.bookingData);

            this.creatBooking();
            this.GetHandymandata();
            this.next();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Failed to initiate payment.' + (err.error || ''));
        },
      });
    } else {
      this.bookingData.method = 'cash';
      this.bookingData.amount = this.bookingData.totalPrice;
      this.bookingData.paymentStatus = 'Pending';

      this.creatBooking();
      this.GetHandymandata();
      this.next();
    }
  }
  //#endregion
  //#region Booking
  bookingData: CreateBookingVM = new CreateBookingVM();
  chatId!: number;
  bookingId!: number;
  handydata!: AdminHandyManDTO;
  isLoading: boolean = false;

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
    

    //Step 5: Save Data
  }

  creatBooking() {
    this.BookingService.createBooking(this.bookingData).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        if (!res.data.chatId) {
          this.toastr.error('Chat could not be initialized. Please try again.');
          return;
        }

        this.chatId = res.data.chatId;

        this.bookingId = res.data.bookingId;

        this.isLoading = false;

        localStorage.removeItem('selectedServices');
        localStorage.removeItem('bookingData');
      },
      error: (err) => {
        this.toastr.error(err.error.message);
        this.isLoading = false;
      },
    });
  }

  GetHandymandata() {
    this.handyManService
      .getHandymanById(this.bookingData.handymanId!)
      .subscribe({
        next: (res) => {
          this.handydata = res;
        },
        error: (err) => {
          this.toastr.error('error retriving handy data');
        },
      });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
  //#endregion
}
