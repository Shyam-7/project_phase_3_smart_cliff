// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, map, of, catchError } from 'rxjs';
// import { isPlatformBrowser } from '@angular/common';


// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private currentUserSubject = new BehaviorSubject<any>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();
//   private readonly USER_KEY = 'currentUser';

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: any
//   ) {
//     if (isPlatformBrowser(this.platformId)) {
//       this.initUserFromStorage();
//       this.setupStorageListener();
//     }
//   }

//   private initUserFromStorage() {
//     if (isPlatformBrowser(this.platformId)) {
//       const user = localStorage.getItem(this.USER_KEY);
//       if (user) this.currentUserSubject.next(JSON.parse(user));
//     }
//   }

//   private setupStorageListener() {
//     if (isPlatformBrowser(this.platformId)) {
//       window.addEventListener('storage', (event) => {
//         if (event.key === this.USER_KEY) {
//           this.currentUserSubject.next(
//             event.newValue ? JSON.parse(event.newValue) : null
//           );
//         }
//       });
//     }
//   }

//   login(email: string, password: string): Observable<boolean> {
//     return this.http.get<any[]>(`/users?email=${encodeURIComponent(email)}`).pipe(
//       map(users => {
//         const user = users[0];
//         if (user && user.password === password) {
//           if (isPlatformBrowser(this.platformId)) {
//             localStorage.setItem(this.USER_KEY, JSON.stringify(user));
//           }
//           this.currentUserSubject.next(user);
//           return true;
//         }
//         return false;
//       }),
//       catchError(() => of(false))
//     );
//   }

//   signup(userData: any): Observable<boolean> {
//     const newUser = { ...userData, role: 'user' };
//     return this.http.post<any>('/users', newUser).pipe(
//       map(user => {
//         if (isPlatformBrowser(this.platformId)) {
//           localStorage.setItem(this.USER_KEY, JSON.stringify(user));
//         }
//         this.currentUserSubject.next(user);
//         return true;
//       }),
//       catchError(() => of(false))
//     );
//   }

//   requestPasswordReset(email: string): Observable<string> {
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log(`Password reset OTP for ${email}: ${otp}`);
//     return of(otp);
//   }

//   resetPassword(email: string, newPassword: string, otp: string): Observable<boolean> {
//     console.log(`Resetting password for ${email} with new password: ${newPassword} and OTP: ${otp}`);
//     return of(true);
//   }

//   logout() {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem(this.USER_KEY);
//     }
//     this.currentUserSubject.next(null);
//   }

//   getCurrentUser() {
//     return this.currentUserSubject.value;
//   }
// }
// src/app/core/auth/auth.service.ts
//====================================Version 2====================================
// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { tap, map, catchError } from 'rxjs/operators';
// import { isPlatformBrowser } from '@angular/common';
// import { User } from '../models/user.model';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private currentUserSubject = new BehaviorSubject<User | null>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();
//   private readonly USER_KEY = 'currentUser';

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     if (isPlatformBrowser(this.platformId)) {
//       this.initUserFromStorage();
//     }
//   }

//   private initUserFromStorage(): void {
//     const user = localStorage.getItem(this.USER_KEY);
//     if (user) {
//       try {
//         this.currentUserSubject.next(JSON.parse(user));
//       } catch {
//         this.clearAuth();
//       }
//     }
//   }

//   login(email: string, password: string): Observable<User> {
//     return this.http.get<User[]>(`/users?email=${encodeURIComponent(email)}`).pipe(
//       map(users => {
//         const user = users.find(u => u.email === email);
//         if (!user || user.password !== password) {
//           throw new Error('Invalid credentials');
//         }

//         // Store user data (without password)
//         const { password: _, ...userToStore } = user;
//         localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
//         this.currentUserSubject.next(userToStore);

//         return userToStore;
//       }),
//       catchError(error => {
//         throw new Error('Login failed. Please try again.');
//       })
//     );
//   }

//   signup(userData: Omit<User, 'id' | 'role'>): Observable<User> {
//     const newUser = { ...userData, role: 'user' as const };
//     return this.http.post<User>('/users', newUser).pipe(
//       tap(user => {
//         this.storeUser(user);
//       })
//     );
//   }

//   logout(): void {
//     this.clearAuth();
//   }

//   isLoggedIn(): boolean {
//     return !!this.currentUserSubject.value;
//   }

//   isAdmin(): boolean {
//     return this.currentUserSubject.value?.role === 'admin';
//   }

//   private storeUser(user: User): void {
//     // Remove password before storing
//     const { password, ...userToStore } = user;
//     localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
//     this.currentUserSubject.next(userToStore);
//   }

//   private clearAuth(): void {
//     localStorage.removeItem(this.USER_KEY);
//     this.currentUserSubject.next(null);
//   }

//   getCurrentUser(): User | null {
//     return this.currentUserSubject.value;
//   }

//   // Optional testing methods (remove in production)
//   enableTestingMode(mockUser: User): void {
//     this.currentUserSubject.next(mockUser);
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
//     }
//   }

//   // Add these methods to your AuthService class

//   requestPasswordReset(email: string): Observable<string> {
//     // Mock implementation - replace with actual API call

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log(`Password reset OTP for ${email}: ${otp}`); // For debugging
//     return of(otp);
//   }

//   resetPassword(email: string, newPassword: string, otp: string): Observable<boolean> {
//     // Mock implementation - replace with actual API call
//     console.log(`Password reset for ${email} with OTP: ${otp}`); // For debugging
//     return of(true); // Return true for success
//   }
// }
// ===============================version 3================================
// src/app/core/auth/auth.service.ts
// src/app/core/auth/auth.service.ts
// auth.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/users';
  private sessionKey = 'user_session';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const session = localStorage.getItem(this.sessionKey);
      if (session) this.currentUserSubject.next(JSON.parse(session));
    }
  }

  login(email: string, password: string) {
    return this.http
      .get<User[]>(`${this.baseUrl}?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length === 1) {
            const user = users[0];
            user.token = this.generateToken();
            this.storeSession(user);
            return user;
          } else {
            throw new Error('Invalid credentials');
          }
        })
      );
  }
  signup(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.get<User[]>(`${this.baseUrl}?email=${userData.email}`).pipe(
      switchMap(existing => {
        if (existing.length > 0) {
          throw new Error('Email already exists');
        }
        const newUser = {
          ...userData,
          role: 'user',
          token: this.generateToken()
        };
        return this.http.post<User>(this.baseUrl, newUser);
      })
    );
  }

  requestPasswordReset(email: string) {
    return this.http.get<User[]>(`${this.baseUrl}?email=${email}`).pipe(
      switchMap(users => {
        if (users.length !== 1) {
          throw new Error('User not found');
        }

        const user = users[0];
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`[DEBUG] OTP for ${email} is: ${resetCode}`);

        return this.http.patch(`${this.baseUrl}/${user.id}`, {
          resetCode
        }).pipe(map(() => resetCode));
      })
    );
  }

  resetPassword(code: string, newPassword: string) {
    return this.http.get<User[]>(`${this.baseUrl}?resetCode=${code}`).pipe(
      switchMap(users => {
        if (users.length !== 1) {
          throw new Error('Invalid or expired reset code');
        }

        const user = users[0];
        return this.http.patch(`${this.baseUrl}/${user.id}`, {
          password: newPassword,
          resetCode: '' // clear it after use
        });
      })
    );
  }
  private getLocalStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  storeSession(user: User) {
    const token = this.generateToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour in ms

    const sessionData = {
      ...user,
      token,
      tokenExpiresAt: expiresAt
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    this.currentUserSubject.next(sessionData);
  }

  logout(redirect = true) {
    localStorage.removeItem(this.sessionKey);
    this.currentUserSubject.next(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }


  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const session = localStorage.getItem(this.sessionKey);
    if (!session) return null;

    try {
      const parsedSession = JSON.parse(session);
      if (Date.now() > parsedSession.tokenExpiresAt) {
        this.logout();
        return null;
      }
      return parsedSession;
    } catch {
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }


  private generateToken(): string {
    return Math.random().toString(36).substr(2);
  }

}

