import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { apiConfig } from '../../api.config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${apiConfig.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public currentUser$: Observable<any>; // Alias for compatibility

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if running in browser before accessing localStorage
    const savedUser = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' 
      ? JSON.parse(localStorage.getItem('currentUser') || 'null')
      : null;
    
    this.currentUserSubject = new BehaviorSubject<any>(savedUser);
    this.currentUser = this.currentUserSubject.asObservable();
    this.currentUser$ = this.currentUser; // Alias
  }

  // Safe localStorage access methods
  private setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  // Method to get current user (for compatibility)
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any>;
  login(email: string, password: string): Observable<any>;
  login(emailOrCredentials: any, password?: string): Observable<any> {
    let credentials: any;
    
    if (typeof emailOrCredentials === 'string' && password) {
      credentials = { email: emailOrCredentials, password: password };
    } else {
      credentials = emailOrCredentials;
    }

    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.setItem('authToken', response.token);
          this.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(navigate: boolean = true): void {
    this.removeItem('authToken');
    this.removeItem('currentUser');
    this.currentUserSubject.next(null);
    if (navigate) {
      this.router.navigate(['/auth/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getItem('authToken');
  }

  // Password reset methods (placeholder implementations)
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(resetCode: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      resetCode, 
      newPassword 
    });
  }

  // Role management method
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }
}