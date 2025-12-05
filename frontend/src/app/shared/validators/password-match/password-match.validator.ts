import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl):ValidationErrors | null => {
  let password = group.get('password');
  let confirm = group.get('confirmPassword');

  if (password?.value !== confirm?.value) {
    confirm?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
    return null;
};

