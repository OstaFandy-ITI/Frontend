import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLoginDto, UserRegisterDto } from '../models/user.model';
import { URL } from '../Shared/URL';


@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private BaseUrl = `${URL.apiUrl}/Auth`;
  constructor(private http: HttpClient) { }
///api/Auth/login
  Login(data: UserLoginDto): Observable<any> {
    var res= this.http.post(`${this.BaseUrl}/login`, data);
    return res;
  }
///api/Auth/register-Customer
  Register(data: UserRegisterDto): Observable<any> {
    var res = this.http.post(`${this.BaseUrl}/register-Customer`, data);
    return res;
  }
}
