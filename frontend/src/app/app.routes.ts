import {adminGuard} from '@admin/admin.guard';
import {AdminComponent} from '@admin/admin/admin.component';
import {Routes} from '@angular/router';
import {authGuard} from '@auth/auth.guard';
import {guestBlockGuard} from '@auth/guest-block.guard';
import {viewFestivalsGuard} from '@auth/view-festivals.guard';
import {viewPublishersGuard} from '@auth/view-publishers.guard';
import {LoginPage} from 'src/app/pages/login-page/login-page.component';
import {RegisterPage} from 'src/app/pages/register-page/register-page.component';

import {FestivalList} from './festivals/festival-list-component/festival-list';
import {GameList} from './games/game-list/game-list';
import {Game} from './games/game/game';
import {AwaitConfirmationPage} from './pages/await-confirmation-page/await-confirmation-page.component';
import {Festival} from './pages/festival/festival';
import {FestivalsPage} from './pages/festivals-page/festivals-page';
import {HomePage} from './pages/home/home.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {Publisher} from './pages/publisher/publisher';
import {publisherResolver} from './pages/publisher/publisher.resolver';
import {PublishersList} from './pages/publishers-list/publishers-list';

export const routes: Routes =
    [
        {path: 'login', component: LoginPage},
        {path: 'register', component: RegisterPage},
        {path: 'await-confirmation', component: AwaitConfirmationPage, canActivate: [authGuard]},
        {path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard, guestBlockGuard]},
        {path: 'festivals', component: FestivalsPage, canActivate: [authGuard, guestBlockGuard, viewFestivalsGuard]},
        {path: 'festivals/:id', component: Festival, canActivate: [authGuard, guestBlockGuard, viewFestivalsGuard]},
        {path: 'publishers', component: PublishersList, canActivate: [authGuard, guestBlockGuard, viewPublishersGuard]},
        {
            path: 'publishers/:id',
            component: Publisher,
            resolve: {publisher: publisherResolver},
            canActivate: [authGuard, guestBlockGuard, viewPublishersGuard],
        },
        {path: '', pathMatch: 'full', redirectTo: 'festivals'},
        {path: '**', component: NotFoundComponent},
    ]

    // Note: guestBlockGuard is used to prevent guest users from accessing certain routes before their account is
    // confirmed by an admin