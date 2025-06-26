export interface ServiceUsageStat {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  usageCount: number;
}

export interface ServiceUsageStatsResponse {
  success: boolean;
  message: string;
  data: ServiceUsageStat[];
  count: number; 
}

export interface AddressBookingStat {
  address: string;
  bookingCount: number;
}

export interface CityBookingStat {
  city: string;
  bookingCount: number; 
  addresses: AddressBookingStat[]; 
}

export interface BookingLocationStatsResponse {
  success: boolean;
  message: string;
  data: CityBookingStat[];
  count: number;
  totalBookings: number; 
}