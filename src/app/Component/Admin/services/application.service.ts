import { Injectable } from '@angular/core';
import { URL } from '../../../core/Shared/URL';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../../../core/models/Application';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private BaseUrl = `${URL.apiUrl}/AdminHandyMan`;
  
  
  constructor(private http: HttpClient) { }

  // Get all pending handyman applications
  getPendingApplications(): Observable<any> {
    const url = `${this.BaseUrl}/pending`;
    console.log('Fetching pending applications from:', url);
    return this.http.get<any>(url);
  }

  updateHandymanStatus(userId: number, status: 'Approved' | 'Rejected'): Observable<any> {
    const url = `${this.BaseUrl}/status/${userId}`;
    console.log('Updating handyman status at:', url, 'Status:', status);
    
    const requestBody = { 
      userId: userId,
      status: status 
    };
    // console.log('Request body:', requestBody);
    
    return this.http.put(url, requestBody);
  }

  // Helper method to approve handyman
  approveHandyman(userId: number): Observable<any> {
    return this.updateHandymanStatus(userId, 'Approved');
  }

  // Helper method to reject handyman
  rejectHandyman(userId: number): Observable<any> {
    return this.updateHandymanStatus(userId, 'Rejected');
  }


}