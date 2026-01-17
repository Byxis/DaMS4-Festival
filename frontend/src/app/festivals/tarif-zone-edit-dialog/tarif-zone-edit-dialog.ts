import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ZoneTarifDTO } from '../dtos/zone-tarif-dto';

@Component({
  selector: 'app-tarif-zone-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './tarif-zone-edit-dialog.html',
  styleUrl: './tarif-zone-edit-dialog.scss',
})
export class TarifZoneEditDialog {
  private readonly dialogRef = inject(MatDialogRef<TarifZoneEditDialog>);
  private readonly data: { festivalId: number; zone: ZoneTarifDTO | null } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  isEditing: boolean;

  constructor() {
    this.isEditing = !!this.data.zone;

    this.form = this.fb.group({
      name: [this.data.zone?.name ?? '', [Validators.required, Validators.minLength(3)]],
      price: [this.data.zone?.price ?? 0, [Validators.required, Validators.min(0)]],
      electricalOutlet: [this.data.zone?.electricalOutlet ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditing ? 'Modifier la zone tarifaire' : 'Créer une zone tarifaire';
  }
}