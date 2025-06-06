import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDto } from '../models/Response'; 
import { UserLoginDto, UserRegisterDto } from '../models/user.model';
import { URL } from '../Shared/URL';


@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private BaseUrl = `${URL.apiUrl}/Auth`;
  constructor(private http: HttpClient) { }
///api/Auth/login
Login(data: UserLoginDto): Observable<ResponseDto<string>> {
  return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/login`, data);
}
///api/Auth/register-Customer
  Register(data: UserRegisterDto): Observable<ResponseDto<string>> {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/register-Customer`, data);
  }
}
