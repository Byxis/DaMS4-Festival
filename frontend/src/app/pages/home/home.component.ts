import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth/auth.service';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';

@Component({
  selector: 'home-page',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePage {
  readonly authSvc = inject(AuthService);
  readonly router = inject(Router);
}
