import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const router = inject(Router);

  if (!authSvc.isLoggedIn() || !authSvc.isAdmin()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
