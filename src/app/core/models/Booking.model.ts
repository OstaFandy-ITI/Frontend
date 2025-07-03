export class BookingViewModel {
    constructor(
        public id?: number,
        public clientName?: string,
        public handymanName?: string,
        public categoryName?: string,
        public serviceNames?: string[],
        public note?: string,
        public preferredDate?: string,
        public estimatedMinutes?: number,
        public status?: string,
        public latitude?: number,
        public longitude?: number,
    ) {}
}

export class BookingServiceDTO {
  constructor(
    public serviceId: number,
    public quantity: number
  ) {}
}

export class CreateBookingVM {
  constructor(
    public clientId?: number,
    public addressId?: number,
    public preferredDate?: Date, 
    public estimatedMinutes?: number,
    public totalPrice?: number,
    public note?: string,
    public serviceDto?: BookingServiceDTO[],
    public handymanId?: number,
    public amount?: number,
    public method?: string,
    public paymentStatus?: string,
    public paymentIntentId?: string,
  ) {}
}

export class slots{
  constructor(
    public userId?:number,
    public startTime?:Date,
    public endTime?:Date,
    public slotLength?:number
  )
  {}
}

export class bookingFilterDto
{
  constructor(
    public pageNumber: string,
    public pageSize: string,
    public handymanName: string = '',
    public status: string = '',
    public isActive: boolean | null = null
  ){}

}
