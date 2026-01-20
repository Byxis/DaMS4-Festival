import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {Router, RouterOutlet} from '@angular/router';
import {AuthService} from '@auth/auth.service';

import {HeaderComponent} from './pages/header/header.component';


export class AppModule
{
}

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
        HeaderComponent
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App
{
    protected readonly title = signal('AYAE Festivals');
    readonly authSvc = inject(AuthService);
    readonly router = inject(Router);

    constructor()
    {
        this.authSvc.whoami();
    }

    logout()
    {
        this.authSvc.logout();
    }

    goToLoginPage()
    {
        this.router.navigate(['/login']);
    }
}
