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
