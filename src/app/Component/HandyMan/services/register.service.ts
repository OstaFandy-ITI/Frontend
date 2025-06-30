import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HandymanApplication } from '../../../core/models/Handyman.model';
import { ResponseDto } from '../../../core/models/Response.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private BaseUrl = `${URL.apiUrl}/AdminHandyMan`;
  constructor(private http: HttpClient) {}

  ///api/AdminHandyMan/Handyman-register
  RegisterHandyMan(Handyman: HandymanApplication) {
    const formData = new FormData();

    //user part
    formData.append('Email', Handyman.email || '');
    formData.append('FirstName', Handyman.firstname || '');
    formData.append('LastName', Handyman.lastname || '');
    formData.append('Phone', Handyman.phone || '');
    formData.append('Password', Handyman.password || '');
    formData.append('ConfirmPassword', Handyman.confirmpassword || '');

    //handyman part
    formData.append(
      'SpecializationId',
      (Handyman.SpecializationId ?? 0).toString()
    );
    formData.append('Latitude', Handyman.Latitude?.toString() || '');
    formData.append('Longitude', Handyman.Longitude?.toString() || '');
    formData.append('NationalId', Handyman.NationalId || '');
    if (Handyman.NationalIdImg) {
      formData.append('NationalIdImg', Handyman.NationalIdImg);
    }
    if (Handyman.Img) {
      formData.append('Img', Handyman.Img);
    }
    formData.append(
      'ExperienceYears',
      (Handyman.ExperienceYears ?? 0).toString()
    );

    //address part
    formData.append('Address', Handyman.Address || '');
    formData.append('City', Handyman.City || '');
    formData.append('AddressType', Handyman.AddressType || '');
    formData.append('IsDefault', (Handyman.IsDefault ?? false).toString());

    return this.http.post<ResponseDto<string>>(
      `${this.BaseUrl}/Handyman-register`,
      formData
    );
  }
}
