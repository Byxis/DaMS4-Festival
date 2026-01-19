import { Routes } from '@angular/router';
import { LoginPage } from 'src/app/pages/login-page/login-page.component';
import { HomePage } from './pages/home/home.component';
import { AdminComponent } from '@admin/admin/admin.component';
import { authGuard } from '@auth/auth.guard';
import { adminGuard } from '@admin/admin.guard';
import { RegisterPage } from 'src/app/pages/register-page/register-page.component';
import { AwaitConfirmationPage } from './pages/await-confirmation-page/await-confirmation-page.component';
import { guestBlockGuard } from '@auth/guest-block.guard';
import { Publisher } from './pages/publisher/publisher';
import { publisherResolver } from './pages/publisher/publisher.resolver';
import { PublishersList } from './pages/publishers-list/publishers-list';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { Game } from './games/game/game';
import { GameList } from './games/game-list/game-list';
import { FestivalList } from './festivals/festival-list-component/festival-list';
import { FestivalsPage } from './pages/festivals-page/festivals-page';
import { viewPublishersGuard } from '@auth/view-publishers.guard';
import { viewFestivalsGuard } from '@auth/view-festivals.guard';


export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage},
  { path: 'await-confirmation', component: AwaitConfirmationPage, canActivate: [authGuard]},
  { path: 'home', component: HomePage, canActivate: [authGuard, guestBlockGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard, guestBlockGuard] },
  { path: 'festivals', component: FestivalsPage, canActivate: [authGuard, guestBlockGuard, viewFestivalsGuard] },
  { path: 'publishers', component: PublishersList, canActivate: [authGuard, guestBlockGuard, viewPublishersGuard] },
  {
    path: 'publishers/:id',
    component: Publisher,
    resolve: { publisher: publisherResolver },
    canActivate: [authGuard, guestBlockGuard, viewPublishersGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', component: NotFoundComponent },
]

// Note: guestBlockGuard is used to prevent guest users from accessing certain routes before their account is confirmed by an admin