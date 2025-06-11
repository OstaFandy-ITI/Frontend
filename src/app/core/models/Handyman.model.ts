export class HandymanApplication {
  constructor(
    public email?: string,
    public firstname?: string,
    public lastname?: string,
    public phone?: string,
    public password?: string,
    public confirmpassword?: string,
    //handyman part
    public SpecializationId?: number,
    public Latitude?: number,
    public Longitude?: number,
    public NationalId?: string,
    public NationalIdImg?: File,
    public Img?: File,
    public ExperienceYears?: number,
    //address part
    public Address?: string,
    public City?: string,
    public AddressType?: string,
    public IsDefault?: boolean
  ) {}
}
