import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ContactDTO } from '../contactDto';
import { ContactValidators } from './contact-validator';

@Component({
  selector: 'contact-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ContactDialog>);
  data = inject<ContactDTO | null>(MAT_DIALOG_DATA);

  form = this.fb.group(
    {
      name: [this.data?.name ?? '', Validators.required],
      familyName: [this.data?.family_name ?? '', Validators.required],
      role: [this.data?.role ?? ''],
      telephone: [this.data?.telephone ?? '', [ContactValidators.phone]],
      email: [this.data?.email ?? '', [ContactValidators.email]],
    },
    { validators: ContactValidators.phoneOrEmailRequired }
  );

  save(): void {
    if (this.form.valid) {
      const contact: ContactDTO = {
        id: this.data?.id,
        name: this.form.value.name!,
        family_name: this.form.value.familyName!,
        role: this.form.value.role ?? '',
        telephone: this.form.value.telephone ?? '',
        email: this.form.value.email ?? '',
      };
      this.dialogRef.close(contact);
    }
  }
}
