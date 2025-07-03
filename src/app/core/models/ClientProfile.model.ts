export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateClientProfileRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ClientOrderHistory {
  orders: ClientOrder[];
  totalOrders: number;
  totalSpent: number;
}

export interface ClientOrder {
  id: number;
  orderNumber: string;
  orderDate: Date;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}