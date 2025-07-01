import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {URL} from '../../../core/Shared/URL'
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

   private BaseUrl = `${URL.apiUrl}/Payment`;
  constructor(private http:HttpClient) { }
  stripePromise = loadStripe('pk_test_51RTR43FwrESOwaE4nDQXs53mC3gFsaQVd5vyRgFW0JZngPoHlDlKM1J3CxI74UWEfAL1msqC6Agoy9vaSKz6aGGD0088lcembe');

  ///api/Payment
  CreatePaymentIntent(amount:number):Observable<{ clientSecret: string }>
  {
    return this.http.post<{ clientSecret: string }>(`${this.BaseUrl}`,  {amount} )
  }
}
