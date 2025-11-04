import { Routes } from '@angular/router';
import { LoginPage } from '@auth/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
