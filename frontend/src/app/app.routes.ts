import { Routes } from '@angular/router';
import { LoginPage } from '@auth/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';
import { Publisher } from './pages/publisher/publisher';
import { guestBlockGuard } from '@auth/guest-block.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage, canActivate: [authGuard, guestBlockGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard, guestBlockGuard] },
  { path: 'festivals', component: HomePage, canActivate: [authGuard, guestBlockGuard] },
  { path: 'publishers', component: HomePage, canActivate: [authGuard, guestBlockGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
