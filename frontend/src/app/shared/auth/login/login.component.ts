import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
    MatIcon,
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
  private readonly route = inject(ActivatedRoute);
  readonly isLoading = this.svc.isLoading;
  readonly error = this.svc.error;

  constructor() {
    effect(() => {
      if (this.svc.isLoggedIn()) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  readonly form = new FormGroup({
    email: new FormControl('', {
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
      var email: string = this.form.value.email ?? '';
      var password: string = this.form.value.password ?? '';
      if (email && password) {
        this.svc.login(email, password);
      }
    }
  }
}
