import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validator function to check if password and confirmPassword fields match
export const passwordMatchValidator: ValidatorFn = (group: AbstractControl):ValidationErrors | null => {
  let password = group.get('password');
  let confirm = group.get('confirmPassword');

  // If passwords do not match, set error on confirmPassword field
  if (password?.value !== confirm?.value) {
    confirm?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
    return null;
};

