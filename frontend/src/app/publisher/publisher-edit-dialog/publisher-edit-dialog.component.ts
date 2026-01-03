import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PublisherDTO } from '../publisherDto';

@Component({
  selector: 'publisher-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './publisher-edit-dialog.html',
  styleUrl: './publisher-edit-dialog.scss',
})
export class PublisherEditDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PublisherEditDialog>);
  data = inject<PublisherDTO | null>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
  });

  currentLogoUrl: string | null = this.data?.logoUrl ?? null;
  newLogoFile: File | null = null;
  newLogoPreview: string | null = null;
  logoToDelete: boolean = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newLogoFile = input.files[0];
      this.logoToDelete = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.newLogoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.newLogoFile);
    }
  }

  deleteLogo(): void {
    this.logoToDelete = true;
    this.newLogoFile = null;
    this.newLogoPreview = null;
  }

  deleteNewLogo(): void {
    this.newLogoFile = null;
    this.newLogoPreview = null;
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        publisher: { ...this.data, name: this.form.value.name || '' } as PublisherDTO,
        newLogo: this.newLogoFile,
        deleteLogo: this.logoToDelete,
      });
    }
  }
}
