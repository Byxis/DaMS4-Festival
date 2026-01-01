import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ContactValidators {
  static phoneOrEmailRequired(control: AbstractControl): ValidationErrors | null {
    const telephone = control.get('telephone')?.value?.trim();
    const email = control.get('email')?.value?.trim();

    if (!telephone && !email) {
      return { phoneOrEmailRequired: true };
    }
    return null;
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const cleaned = value.replace(/[\s\-\.\(\)]/g, '');
    const phoneRegex = /^(\+\d{1,3})?\d{9,14}$/;

    if (!phoneRegex.test(cleaned)) {
      return { phone: true };
    }

    return null;
  }

  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value.trim())) {
      return { email: true };
    }

    return null;
  }
}
