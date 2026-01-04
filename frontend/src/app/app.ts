import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/auth.service';
import { HeaderComponent } from './pages/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('AYAE Festivals');
  readonly authSvc = inject(AuthService);
  readonly router = inject(Router);

  constructor() {
    this.authSvc.whoami();
  }

  logout() {
    this.authSvc.logout();
  }

  goToLoginPage() {
    this.router.navigate(['login']);
  }
}
