import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Guard to block guest users from accessing certain routes before admin confirmation of said account

export const guestBlockGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const router = inject(Router);

  if (authSvc.isGuest()) {
    return router.createUrlTree(['/await-confirmation']);
  }

  return true;
};
