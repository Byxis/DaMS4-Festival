import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/auth.service';
import { passwordMatchValidator } from '../../validators/password-match/password-match.validator';

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
    firstname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(1), Validators.required],
    }),
    lastname: new FormControl('', {
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
    
    console.log ('Registering user with data:', this.form.value);
  }

}
