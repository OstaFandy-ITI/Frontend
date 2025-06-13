// models/client.models.ts
export interface AddressDTO {
  id: number;
  userId: number;
  address1: string;
  city: string;
  latitude?: number;
  longitude?: number;
  addressType: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminDisplayClientDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  clientUserId: number;
  defaultAddressId?: number;
  defaultAddress?: AddressDTO;
  addresses: AddressDTO[];
  totalBookings: number;
  activeBookings: number;
  totalSpent: number;
}

export interface AdminEditClientDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  defaultAddressId?: number;
}

export interface ClientListResponse {
  data: AdminDisplayClientDTO[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface ClientDetailResponse {
  data: AdminDisplayClientDTO;
}

export interface ClientSearchParams {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean | null;
}