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

export interface AdminBlockDateDTO {
  id: number;
  userId: number;
  reason: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobAssignmentDTO {
  id: number;
  bookingId: number;
  handymanId: number;
  status: string;
  isActive: boolean;
  assignedAt: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface AdminHandyManDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  specializationCategory: string;
  latitude?: number;
  longitude?: number;
  defaultAddressPlace?: string;
  nationalId: string;
  nationalIdImg: string;
  img: string;
  experienceYears: number;
  status: string;
  adminBlockDateDTO: AdminBlockDateDTO[];
  defaultAddress: AddressDTO;
  jobAssignments: JobAssignmentDTO[];
}

export interface CreateHandymanDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  specializationId: number;
  latitude?: number;
  longitude?: number;
  nationalId: string;
  nationalIdImg: string;
  img: string;
  experienceYears: number;
  status: string;
  defaultAddressPlace?: string;
  addressType: string;
  defaultAddressCity?: string;
  defaultAddressLatitude?: number;
  defaultAddressLongitude?: number;
}

export interface EditHandymanDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializationId: number;
  latitude?: number;
  longitude?: number;
  nationalId: string;
  nationalIdImg: string;
  img: string;
  experienceYears: number;
  status: string;
  // defaultAddressPlace?: string;
  // addressType: string;
  // defaultAddressCity?: string;
  // defaultAddressLatitude?: number;
  // defaultAddressLongitude?: number;
}

export interface HandymanStatusUpdateDTO {
  userId: number;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchString: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}