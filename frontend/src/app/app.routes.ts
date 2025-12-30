import { Routes } from '@angular/router';
import { LoginPage } from 'src/app/pages/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';
import { RegisterPage } from 'src/app/pages/register-page/register-page.component';
import { AwaitConfirmationPage } from './pages/await-confirmation-page/await-confirmation-page.component';
import { guestBlockGuard } from '@auth/guest-block.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage},
  { path: 'await-confirmation', component: AwaitConfirmationPage, canActivate: [authGuard]},
  { path: 'home', component: HomePage, canActivate: [authGuard, guestBlockGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard, guestBlockGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];

// Note: guestBlockGuard is used to prevent guest users from accessing certain routes before their account is confirmed by an admin