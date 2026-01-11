import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PublisherDTO } from '../publisherDto';
import { map, Observable, of } from 'rxjs';
import { PublisherService } from '../publisher.service';


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
  private publisherService = inject(PublisherService); 
  data = inject<PublisherDTO | null>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required , this.publisherNameValidator()],
  });

  currentLogoUrl: string | null = this.data?.logoUrl ?? null;
  newLogoFile: File | null = null;
  newLogoPreview: string | null = null;
  logoToDelete: boolean = false;
  

 private publisherNameValidator() {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return this.publisherService.checkPublisherExists(control.value).pipe(
      map((response: any) => {  
        if (response.existsInPublisher) {
          return { 'publisherExists': true };  
        }
        if (response.existsInEditors) {
          return { 'canImport': response.editor };  
        }
        return null;  
      })
    );
  };
}

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
