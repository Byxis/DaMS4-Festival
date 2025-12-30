import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatCardFooter,
} from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/auth.service';

@Component({
  selector: 'login',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatCardContent,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatCardFooter,
    RouterLink,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class Login {
  private readonly svc = inject(AuthService);
  private readonly router = inject(Router);
  readonly isLoading = this.svc.isLoading;
  readonly error = this.svc.error;

  constructor() {
    effect(() => {
      const user = this.svc.currentUser();
      if (!user) return;

      this.svc.redirectAfterAuth(this.router);
    });
  }

  readonly form = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(5), Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required],
    }),
  });

  submit() {
    if (this.form.valid) {
      var login: string = this.form.value.login ?? '';
      var password: string = this.form.value.password ?? '';
      if (login && password) {
        this.svc.login(login, password);
      }
    }
  }
}
