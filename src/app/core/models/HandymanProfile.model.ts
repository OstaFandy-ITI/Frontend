export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface HandymanProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  specializationName: string;
  experienceYears: number;
  status: string;
  defaultAddress: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface UpdateHandymanProfilePhotoRequest {
  profilePhoto: File;
}

export interface UpdateHandymanProfilePhotoResponse {
  message: string;
  profilePictureUrl: string;
}