import { ResetPasswordDto } from './../models/user.model';
import { ForgetPasswordComponent } from './../../auth/forget-password/forget-password.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDto } from '../models/Response.model'; 
import { UserLoginDto, UserRegisterDto } from '../models/user.model';
import { URL } from '../Shared/URL';


@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private BaseUrl = `${URL.apiUrl}/Auth`;
  constructor(private http: HttpClient) { }
//Auth/login
Login(data: UserLoginDto): Observable<ResponseDto<string>> {
  return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/login`, data);
}
//Auth/register-Customer
  Register(data: UserRegisterDto): Observable<ResponseDto<string>> {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/register-Customer`, data);
  }
  //Auth/forgot-password
  ForgetPass(email:string):Observable<ResponseDto<string>>
  {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/forgot-password`,JSON.stringify(email), 
  {
    headers: { 'Content-Type': 'application/json' }
  });

  }

  //Auth/reset-password
  ResetPass(ResetPass:ResetPasswordDto):Observable<ResponseDto<string>>
  {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/reset-password`,ResetPass);
  }
  //Auth/resend-verification
  ResendVerification(useremail:string):Observable<ResponseDto<string>>
  {
    return this.http.post<ResponseDto<string>>(`${this.BaseUrl}/resend-verification`,JSON.stringify(useremail), 
  {
    headers: { 'Content-Type': 'application/json' }
  });
  }
}
