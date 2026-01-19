import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ZoneGameDTO } from '../dtos/zone-game-dto';

@Component({
  selector: 'app-game-zone-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './game-zone-edit-dialog.html',
  styleUrl: './game-zone-edit-dialog.scss',
})
export class GameZoneEditDialog {
  private readonly dialogRef = inject(MatDialogRef<GameZoneEditDialog>);
  private readonly data: { 
    festivalId: number; 
    tarifZoneId: number; 
    gameZone: ZoneGameDTO | null 
  } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  isEditing: boolean;

  constructor() {
    this.isEditing = !!this.data.gameZone;

    this.form = this.fb.group({
      name: [this.data.gameZone?.name ?? '', [Validators.required, Validators.minLength(3)]],
    });
  }

  submit(): void {
    if (this.form.valid) {
      const formValue = {
        name: this.form.value.name,
        reserved_table: 0,
        reserved_big_table: 0,
        reserved_town_table: 0,
      };
      this.dialogRef.close(formValue);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditing ? 'Modifier la zone de jeu' : 'Créer une zone de jeu';
  }
}