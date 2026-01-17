import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FestivalService } from '../festival-service/festival-service';
import { FestivalDto } from '../dtos/festival-dto';

@Component({
  selector: 'app-festival-new-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './festival-new-form-component.html',
  styleUrl: './festival-new-form-component.scss'
})
export class FestivalNewFormComponent {

  private readonly dialogRef = inject(MatDialogRef<FestivalNewFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly festivalService = inject(FestivalService);

  form: FormGroup;
  isEditing = false;
  festivalId: number | null = null;


  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;


  constructor() {
    // Initialize flags from data
    this.isEditing = this.data?.isEditing ?? false;
    this.festivalId = this.data?.festivalId ?? null;

    // Create form with empty values first
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      table_count: ['', [Validators.required, Validators.min(0)]],
      big_table_count: ['', [Validators.required, Validators.min(0)]],
      town_table_count: ['', [Validators.required, Validators.min(0)]]
    });

    // Populate form after it's created
    if (this.isEditing && this.data?.festival) {
      setTimeout(() => this.populateForm(this.data.festival), 0);
    }
  }

  private populateForm(festival: FestivalDto): void {
    // Convert dates to YYYY-MM-DD format
    const startDate = this.formatDateForInput(festival.start_date);
    const endDate = this.formatDateForInput(festival.end_date);

    this.form.patchValue({
      name: festival.name,
      location: festival.location,
      start_date: startDate,
      end_date: endDate,
      table_count: festival.table_count,
      big_table_count: festival.big_table_count,
      town_table_count: festival.town_table_count
    });
  }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${year}-${month}-${day}`;
  }

submit(): void {
    if (this.form.invalid) return;

    const formData: Omit<FestivalDto, 'id'> = this.form.value;

    if (this.isEditing && this.festivalId) {
      this.festivalService.updateFestival(
        this.festivalId, 
        formData, 
        this.selectedLogoFile || undefined
      );
    } else {
      this.festivalService.addFestival(formData, this.selectedLogoFile || undefined);
    }

    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditing ? 'Éditer le festival' : 'Créer un nouveau festival';
  }

  getSubmitButtonText(): string {
    return this.isEditing ? 'Mettre à jour' : 'Créer';
  }



  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
  }

}