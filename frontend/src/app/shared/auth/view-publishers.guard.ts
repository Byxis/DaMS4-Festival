import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const viewPublishersGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const router = inject(Router);

  if (!authSvc.isEditor() && !authSvc.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
