import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UserDto } from '../../shared/types/user-dto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { roleFrToEn } from 'src/app/shared/utils/roles';


@Component({
  selector: 'create-user-dialog',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatSelectModule,],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateUserDialog {

  private readonly dialogRef = inject(MatDialogRef<CreateUserDialog>);
  readonly roles = ['Administrateur', 'Rédacteur', 'Éditeur de jeux', 'Invité'];
  readonly data = inject<UserDto | null>(MAT_DIALOG_DATA, { optional: true });


  readonly form = new FormGroup({
    firstName: new FormControl(this.data?.firstName ?? '', {
      nonNullable: true,
      validators: [
        Validators.pattern(/^[A-Za-z\- ]*$/), // empty allowed
      ],
    }),

    lastName: new FormControl(this.data?.lastName ?? '', {
      nonNullable: true,
      validators: [
        Validators.pattern(/^[A-Za-z\- ]*$/), // empty allowed
      ],
    }),

    email: new FormControl(this.data?.email ?? '', {
      nonNullable: true,
      validators: [Validators.email, Validators.required, Validators.minLength(5)],
    }),

    role: new FormControl<string | ''>(this.data?.role ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit(): void {
    if (!this.form.valid) return;

    const email = this.form.value.email ?? '';
    const role = this.form.value.role ?? '';

    if (!email || !role) return;

    const firstName = this.form.value.firstName?.trim() ?? '';
    const lastName = this.form.value.lastName?.trim() ?? '';
    
    //convert role to english
    const roleEn = roleFrToEn(role);

    const payload: Partial<UserDto> = {
      id: this.data?.id, 
      email: email.trim(),
      role: roleEn,
      firstName: firstName,
      lastName: lastName,
    };

    this.dialogRef.close({ user: payload });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}

