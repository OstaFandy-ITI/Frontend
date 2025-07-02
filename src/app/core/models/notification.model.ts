export interface Notification {
    id: number;
    userId: number;
    type: string; // "QuoteApproval", "JobStatusChange", etc.
    title: string;
    message: string;
    createdAt: Date;
    isRead: boolean;
    relatedEntityType?: string; // "Quote", "JobAssignment", etc.
    relatedEntityId?: number;
    currentJobStatus?: string;
    actionTaken?: 'approved' | 'dismissed' | 'accept' | 'reject';
}

// New interfaces for quote handling
export interface QuoteDetails {
    quoteId: number;
    jobId: number;
    handymanId: number;
    handymanName: string;
    price: number;
    estimatedMinutes: number;
    notes: string;
    originalBookingId: number;
    clientId: number;
    addressId: number;
    originalPreferredDate: Date;
    originalServices: BookingServiceDTO[];
}

export interface CreateBookingDTO {
    clientId: number;
    addressId: number;
    preferredDate: Date;
    estimatedMinutes: number;
    totalPrice: number;
    note: string;
    serviceDto: BookingServiceDTO[];
    handymanId: number;
    amount: number;
    method: string;
    paymentStatus: string;
    receiptUrl: string;
}

export interface BookingServiceDTO {
    serviceId: number;
    quantity: number;
}

export interface QuoteResponseDTO {
    quoteId: number;
    action: string; // "accept" or "reject"
    clientUserId: number;
    bookingData?: CreateBookingDTO;
}