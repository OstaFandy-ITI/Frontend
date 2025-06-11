export class Application {
    constructor(
        public userId?: number,
        public firstName?: string,
        public lastName?: string,
        public email?: string,
        public phone?: string,
        public isActive?: boolean,
        public createdAt?: string,
        public updatedAt?: string,
        public specializationCategory?: string,
        public latitude?: number,
        public longitude?: number,
        public defaultAddressPlace?: string,
        public nationalId?: string,
        public nationalIdImg?: string,
        public img?: string,
        public experienceYears?: number,
        public status?: string,
        public adminBlockDateDTO?: any[]
    ) {}

    // Helper method to get full name
    get fullName(): string {
        return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }

    // Helper method to format submitted date
    get formattedSubmittedDate(): string {
        if (!this.createdAt) return '';
        return new Date(this.createdAt).toLocaleDateString('en-US');
    }

    // Helper method to check if application is pending
    get isPending(): boolean {
        return this.status === 'Pending';
    }
}