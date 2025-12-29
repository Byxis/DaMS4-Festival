import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth/auth.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Game } from './games/game/game';
import { GameList } from './games/game-list/game-list';
import { GameForm } from './games/game-form/game-form';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


export class AppModule {}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatToolbarRow,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule, 
    MatIconModule,
    RouterLinkActive,
    MatIcon,
    MatButton,
    GameList, 
    GameForm
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
