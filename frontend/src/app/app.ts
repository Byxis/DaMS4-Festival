import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@auth/auth.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatToolbarRow,
    RouterLinkActive,
    MatIcon,
    MatButton,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
  readonly authSvc = inject(AuthService);
  readonly router = inject(Router);

  constructor() {
    this.authSvc.whoami();

    effect(() => {
      if (!this.authSvc.isLoggedIn()) {
        this.router.navigate(['login']);
      }
    });
  }

  logout() {
    this.authSvc.logout();
  }

  goToLoginPage() {
    this.router.navigate(['login']);
  }
}
