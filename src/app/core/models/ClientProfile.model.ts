import { Observable } from "rxjs";

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  bookingId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface Address {
  id: number; 
  userId: number;
  address: string; 
  city: string;
  addressType: string;
  latitude: number;
  longitude: number;
  isDefault: boolean; 
  isActive: boolean;
  createdAt: string;
  updatedAt?: string; 
}

export interface ClientProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress: Address | null; 
  addresses: Address[]; 
  fullName?: string;
  profilePicture?: string;
}

export interface UpdateClientProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface AddAddressRequest {
  userId: number;
  address1: string; 
  city: string;
  latitude: number;
  longitude: number;
  addressType: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AddAddressResponse {
  address: Address; 
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ClientOrderHistory {
  orders: any[];
}

export interface Booking {
  bookingId: number;
  orderDate: string;
  preferredDate: string;
  status: string;
  totalPrice: number;
  estimatedMinutes: number;
  note: string | null;
  handymanName: string;
  address: {
    fullAddress: string;
    city: string;
  };
  services: Array<{
    serviceName: string;
    categoryName: string;
    fixedPrice: number;
    estimatedMinutes: number;
  }>;
  payment: {
    amount: number;
    method: string;
    status: string;
    paymentDate: string;
  };
  review: any;
}

export interface ClientQuote {
  quoteId: number;
  bookingId: number;
  handymanName: string;
  price: number;
  notes: string;
  status: string;
  createdAt: string;
  bookingDate: string;
  services: string[];
  categoryName: string;
}

export interface ClientProfileApiResponse extends ClientProfile {}
export interface ClientProfileResponse extends ApiResponse<ClientProfile> {}
export interface ClientProfileService {
  addAddress(addressData: AddAddressRequest): Observable<ApiResponse<AddAddressResponse>>;
}