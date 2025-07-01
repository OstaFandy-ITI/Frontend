// models/client-profile.model.ts

export interface ClientProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress: DefaultAddress;
  statusCode: number;
}

export interface DefaultAddress {
  id: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  addressType: string;
}

export interface UpdateClientProfileRequest {
  firstName: string;
  lastName: string;
  username: string;
  country: string;
  state: string;
  city: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  address?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ClientOrderHistory {
  clientId: number;
  clientName: string;
  email: string;
  phone: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  orders: Order[];
}

export interface Order {
  bookingId: number;
  orderDate: string;
  preferredDate: string;
  status: string;
  totalPrice: number;
  estimatedMinutes: number;
  note: string;
  handymanName: string;
  address: OrderAddress;
}

export interface OrderAddress {
  fullAddress: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  statusCode: number;
}