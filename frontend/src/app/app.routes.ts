import { Routes } from '@angular/router';
import { LoginPage } from '@auth/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';
import { Publisher } from './pages/publisher/publisher';
import { publisherResolver } from './pages/publisher/publisher.resolver';
import { PublishersList } from './pages/publishers-list/publishers-list';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { FestivalList } from './festivals/festival-list-component/festival-list';

export const routes: Routes = [
  { path: 'login', component: LoginPage },

  { path: 'festivals', component: FestivalList },
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: 'festivals', component: FestivalList, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: 'publishers', component: PublishersList, canActivate: [authGuard] },
  {
    path: 'publishers/:id',
    component: Publisher,
    resolve: { publisher: publisherResolver },
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', component: NotFoundComponent },
];
