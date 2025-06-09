export class BookingViewModel {
    constructor(
        public id?: Number,
        public clientName?: string,
        public handymanName?: string,
        public serviceNames?: string[],
        public note?: string,
        public status?: Date,
    ) {}
}
