import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private BaseUrl = `${URL.apiUrl}/AdminHandyMan`;
  constructor(http:HttpClient) { }
}
