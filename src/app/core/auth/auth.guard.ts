// import { Injectable } from '@angular/core';
// import { CanActivate, Router, UrlTree } from '@angular/router';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   constructor(private auth: AuthService, private router: Router) {}

//   canActivate(): boolean | UrlTree {
//     // const user = this.auth.getCurrentUser();
    
//     // if (!user) {
//     //   return this.router.createUrlTree(['/auth/login']);
//     // }
    
//     // Only redirect to login if unauthorized
//     return true;
//   }
// }


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};
