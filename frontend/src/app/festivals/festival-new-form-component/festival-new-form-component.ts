import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint, MatError } from "@angular/material/form-field";
import { MatInput } from '@angular/material/input';
import { FestivalDto } from '../festival-dto';
import { FestivalService } from '../festival-service/festival-service';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';


@Component({
  selector: 'app-festival-new-form-component',
  imports: [ReactiveFormsModule,
    MatFormField, MatLabel, MatInput,
    MatButton, MatError, MatHint, MatCard,
    MatCardContent, MatCardTitle, MatCardHeader, MatIcon],
  templateUrl: './festival-new-form-component.html',
  styleUrl: './festival-new-form-component.scss'
})
export class FestivalNewFormComponent {
  festivalService = inject(FestivalService);
  private readonly dialogRef = inject(MatDialogRef<FestivalNewFormComponent>);

  //On créé un output pour notifier la création d'un festival
  readonly festivalCreated = output<void>();

  data = inject<FestivalDto | null>(MAT_DIALOG_DATA);
  currentLogoUrl: string | null = this.data?.logoUrl ?? null;
  newLogoFile: File | null = null;
  newLogoPreview: string | null = null;
  logoToDelete: boolean = false;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    start_date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    end_date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    big_table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    town_table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
  });



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

  submit(): void {
    if (this.form.valid) {
      const newFestival = {
        name: this.form.value.name,
        location: this.form.value.location,
        start_date: this.form.value.start_date,
        end_date: this.form.value.end_date,
        table_count: this.form.value.table_count,
        big_table_count: this.form.value.big_table_count,
        town_table_count: this.form.value.town_table_count,
        // logoUrl will be handled separately
      };
      this.festivalService.addFestival(newFestival as Omit<FestivalDto, 'id'>, this.newLogoFile ?? undefined);

      this.dialogRef.close({
      newLogo : this.newLogoFile,
      deleteLogo : this.logoToDelete});
    }

  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
