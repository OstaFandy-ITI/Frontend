export enum UserType {
  Admin = 'Admin',
  Customer = 'Customer',
  Handyman = 'Handyman',
}
export enum AddressTypes {
  Home = 'Home',
  Work = 'Work',
  Other = 'Other',
}

export class BookingStatus {
  Pending = 'Pending';
  Confirmed = 'Confirmed';
  Completed = 'Completed';
  Cancelled = 'Cancelled';
}

export enum IsDefault {
  true = 1,
  false = 0,
}
