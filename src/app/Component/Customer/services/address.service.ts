import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { Observable } from 'rxjs';
import { AddressDTO, CreateAddressDTO } from '../../../core/models/Address.model';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../../../core/models/Response.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(private http: HttpClient) {}
  private BaseUrl = `${URL.apiUrl}/Address`;

  //GetAddressesByUserId/{UserId}
  GetAddressesByUserId(UserId: number): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(
      `${this.BaseUrl}/GetAddressesByUserId/${UserId}`
    );
  }

  ///api/Address/CreateAddress
  CreateAddress(address:CreateAddressDTO):Observable<ResponseDto<string>>
  {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/CreateAddress`,address);
  }
}
