import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/auth.service';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'register',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatCardContent,
    MatIcon,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    RouterLink,
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
      validators: [Validators.minLength(1), Validators.required, Validators.pattern(/^[A-Za-z\- ]+$/)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required, Validators.pattern(/^[A-Za-z\- ]+$/)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required],
      //TODO: add better email validator 
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required], 
      //TODO: add Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/) for minimum one letter and one number and change minLength to 8 or 12
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    
  },
  {validators: passwordMatchValidator}
);

  constructor() {
    effect(() => {
      const user = this.svc.currentUser();
      if (!user) return;

      this.svc.redirectAfterAuth(this.router);
    });
  }

  submit() {
    if (this.form.valid) {
      var email: string = this.form.value.email ?? '';
      var password: string = this.form.value.password ?? '';
      var firstName: string = this.form.value.firstName ?? '';
      var lastName: string = this.form.value.lastName ?? '';
      if (email && password && firstName && lastName) {
        this.svc.register(email, password, firstName, lastName);
      }
    }
  }
}
