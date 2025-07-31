// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class RoleGuard implements CanActivate {
//   constructor(private auth: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
//     // const expectedRole = route.data['role'];
//     // const user = this.auth.getCurrentUser();
    
//     // if (user?.role !== expectedRole) {
//     //   return this.router.createUrlTree(['/auth/login']);
//     // }
    
//     return true;
//   }
// }
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const user = auth.getCurrentUser();

  console.log('RoleGuard - Expected role:', expectedRole);
  console.log('RoleGuard - Current user:', user);

  if (user && user.role === expectedRole) {
    return true;
  }

  // Handle 'user' role as 'job_seeker' for backward compatibility
  if (user && expectedRole === 'job_seeker' && user.role === 'user') {
    return true;
  }

  // If user is logged in but has wrong role, redirect based on their actual role
  if (user && user.role) {
    if (user.role === 'admin') {
      router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } else if (user.role === 'job_seeker' || user.role === 'user') {
      router.navigate(['/user/dashboard'], { replaceUrl: true });
    } else {
      router.navigate(['/'], { replaceUrl: true });
    }
  } else {
    // Not logged in, redirect to login
    router.navigate(['/auth/login'], { replaceUrl: true });
  }
  
  return false;
};
