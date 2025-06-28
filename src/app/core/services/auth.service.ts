import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggedInUser } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  NameIdentifier?: string;
  Email?: string;
  GivenName?: string;
  Surname?: string;
  UserType?: string;
  exp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private tokenKey = 'Token';
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  private UserLoggedIn = new BehaviorSubject<LoggedInUser | null>(
    this.getUserData()
  );
  public isAuthenticated$ = this.authStatus.asObservable();
  public CurrentUser$ = this.UserLoggedIn.asObservable();


  public CurrentUser$ = this.UserLoggedIn.asObservable();

  //login user
  Login(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.UserLoggedIn.next(this.getUserData());
    this.authStatus.next(true);
  }

  //logout user
  Logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.UserLoggedIn.next(null);
    this.authStatus.next(false);
  }

  //get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getDecodedToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (e) {
      console.error('Invalid token format', e);
      return null;
    }
  }

  private isTokenExpired(token: DecodedToken): boolean {
    const decode = this.getDecodedToken();
    if (!decode) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    return decode.exp < now;
  }

  private hasToken(): boolean {
    return this.getToken() !== null;
  }

  private getUserData(): LoggedInUser | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken || this.isTokenExpired(decodedToken)) {
      return null;
    }
    return new LoggedInUser(
      decodedToken.NameIdentifier,
      decodedToken.Email,
      decodedToken.GivenName,
      decodedToken.Surname,
      decodedToken.UserType,
      decodedToken.exp
    );
  }
}
