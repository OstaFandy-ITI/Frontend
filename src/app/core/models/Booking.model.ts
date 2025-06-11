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
        public status?: string
    ) {}
}
