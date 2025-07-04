import { Observable } from "rxjs";

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

export interface ClientProfileApiResponse extends ClientProfile {}
export interface ClientProfileResponse extends ApiResponse<ClientProfile> {}
export interface ClientProfileService {
  addAddress(addressData: AddAddressRequest): Observable<ApiResponse<AddAddressResponse>>;
}