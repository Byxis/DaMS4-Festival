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
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@auth/auth.service';

@Component({
  selector: 'login',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatIcon,
    MatCardContent,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatCardFooter,
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
      if (this.svc.isLoggedIn()) {
        this.router.navigate(['/']);
      }
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
