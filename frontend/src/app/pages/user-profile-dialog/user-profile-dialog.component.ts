import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UserDto } from '../../shared/types/user-dto';

@Component({
  selector: 'user-profile-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatIcon,
  ],
  templateUrl: './user-profile-dialog.component.html',
  styleUrl: './user-profile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UserProfileDialogComponent>);
  readonly user = inject<UserDto>(MAT_DIALOG_DATA);

  private selectedLogoFile: File | null = null;

  logoPreview: string | null = this.user.logo ?? null;

  readonly form = new FormGroup({
    firstName: new FormControl(this.user.firstName ?? '', {
      nonNullable: true,
      validators: [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\- ]*$/)],
    }),

    lastName: new FormControl(this.user.lastName ?? '', {
      nonNullable: true,
      validators: [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\- ]*$/)],
    }),
  });

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedLogoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (!this.form.valid) return;

    const firstName = this.form.value.firstName?.trim() ?? '';
    const lastName = this.form.value.lastName?.trim() ?? '';

    const payload: Partial<UserDto> = {
      id: this.user.id,
      firstName,
      lastName,
    };

    this.dialogRef.close({
      user: payload,
      logoFile: this.selectedLogoFile,
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
