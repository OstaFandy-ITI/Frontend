export class AddressDTO {
  constructor(
    public id: number,
    public userId: number,
    public address1: string,
    public city: string,
    public latitude?: number,
    public longitude?: number,
    public addressType?: string,
    public isDefault: boolean = false,
    public isActive: boolean = true,
    public createdAt?: Date
  ) {}
}

export class CreateAddressDTO {
  constructor(
    public userId: number,
    public address1: string,
    public city: string,
    public latitude?: number,
    public longitude?: number,
    public addressType?: string,
    public isDefault: boolean = false,
    public isActive: boolean = true,
    public createdAt?: Date
  ) {}
}