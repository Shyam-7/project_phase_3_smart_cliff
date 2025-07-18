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

  if (user && user.role === expectedRole) return true;

  router.navigate(['/auth/login']);
  return false;
};
