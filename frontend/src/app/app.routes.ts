import { Routes } from '@angular/router';
import { LoginPage } from '@auth/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';
import { FestivalList } from './festivals/festival-list-component/festival-list';
import { FestivalsPage } from './pages/festivals-page/festivals-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },

  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: 'festivals', component: FestivalsPage, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
