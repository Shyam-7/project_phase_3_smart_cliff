import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { apiConfig } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${apiConfig.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Legacy method for backward compatibility
  getProfile(): Observable<any> {
    return this.getUserProfile();
  }
}