import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@auth/auth.service';
import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'register',
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
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {

  private readonly svc = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = this.svc.isLoading;
  readonly error = this.svc.error;

  readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    
  },
  {validators: passwordMatchValidator}
);

  submit() {
    if (this.form.valid) {
      var login: string = this.form.value.email ?? '';
      var password: string = this.form.value.password ?? '';
      var firstName: string = this.form.value.firstName ?? '';
      var lastName: string = this.form.value.lastName ?? '';
      if (login && password && firstName && lastName) {
        this.svc.register(login, password, firstName, lastName);
      }
    }
  }

}
