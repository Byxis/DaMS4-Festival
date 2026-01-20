import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';

import {AuthService} from './auth.service';

export const viewFestivalsGuard: CanActivateFn = (route, state) => {
    const authSvc = inject(AuthService);
    const router = inject(Router);

    if (!authSvc.isEditor() && !authSvc.isPublisher() && !authSvc.isAdmin())
    {
        return router.createUrlTree(['/']);
    }

    return true;
};
