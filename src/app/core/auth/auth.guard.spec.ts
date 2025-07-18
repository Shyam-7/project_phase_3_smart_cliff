import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.auth.getCurrentUser();
    
    if (!user) {
      return this.router.createUrlTree(['/auth/login']);
    }
    
    // Redirect to proper dashboard based on role
    if (user.role === 'admin') {
      return this.router.createUrlTree(['/admin/dashboard']);
    } else if (user.role === 'user') {
      return this.router.createUrlTree(['/user/dashboard']);
    }
    
    return this.router.createUrlTree(['/auth/login']);
  }
}