import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

import {FestivalDto} from '../dtos/festival-dto';
import {FestivalService} from '../festival-service/festival-service';

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
export class FestivalNewFormComponent
{
    private readonly dialogRef = inject(MatDialogRef<FestivalNewFormComponent>);
    private readonly data = inject(MAT_DIALOG_DATA);
    private readonly fb = inject(FormBuilder);
    private readonly festivalService = inject(FestivalService);

    form: FormGroup;
    isEditing = false;
    festivalId: number|null = null;

    selectedLogoFile: File|null = null;
    logoPreview: string|null = null;
    hasExistingLogo = false;
    deleteLogo = false;

    constructor()
    {
        // Initialize flags from data
        this.isEditing = this.data?.isEditing ?? false;
        this.festivalId = this.data?.festivalId ?? null;

        // Create form with empty values first
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            location: ['', [Validators.required, Validators.minLength(3)]],
            start_date: ['', Validators.required],
            end_date: ['', Validators.required],
            table_count: [0, [Validators.required, Validators.min(0)]],
            big_table_count: [0, [Validators.required, Validators.min(0)]],
            town_table_count: [0, [Validators.required, Validators.min(0)]],
            table_surface: [4, [Validators.required, Validators.min(0)]],
            big_table_surface: [4, [Validators.required, Validators.min(0)]],
            town_table_surface: [4, [Validators.required, Validators.min(0)]]
        });

        // Populate form if editing
        if (this.isEditing && this.data?.festival)
        {
            this.populateForm(this.data.festival);
        }
    }

    private populateForm(festival: FestivalDto): void
    {
        // Convert dates to YYYY-MM-DD format
        const startDate = this.formatDateForInput(festival.start_date);
        const endDate = this.formatDateForInput(festival.end_date);

        this.form.patchValue({
            name: festival.name,
            location: festival.location,
            start_date: startDate,
            end_date: endDate,
            table_count: festival.table_count ?? 0,
            big_table_count: festival.big_table_count ?? 0,
            town_table_count: festival.town_table_count ?? 0,
            table_surface: festival.table_surface ?? 4,
            big_table_surface: festival.big_table_surface ?? 4,
            town_table_surface: festival.town_table_surface ?? 4
        });

        // Load existing logo if available
        if (festival.logoUrl)
        {
            this.hasExistingLogo = true;
            this.logoPreview = festival.logoUrl;
        }
    }

    private formatDateForInput(date: any): string
    {
        if (!date) return '';

        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();

        return `${year}-${month}-${day}`;
    }

    submit(): void
    {
        if (this.form.invalid) return;

        const formData: Partial<FestivalDto> = this.form.value;

        if (this.isEditing && this.festivalId)
        {
            this.festivalService.updateFestival(
                this.festivalId, formData, this.selectedLogoFile || undefined, this.deleteLogo);
        }
        else
        {
            this.festivalService.addFestival(formData as Omit<FestivalDto, 'id'>, this.selectedLogoFile || undefined);
        }

        this.dialogRef.close(true);
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    getTitle(): string
    {
        return this.isEditing ? 'Éditer le festival' : 'Créer un nouveau festival';
    }

    getSubmitButtonText(): string
    {
        return this.isEditing ? 'Mettre à jour' : 'Créer';
    }

    onLogoSelected(event: Event): void
    {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0])
        {
            this.selectedLogoFile = input.files[0];
            this.deleteLogo = false;
            this.hasExistingLogo = false;

            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                this.logoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(this.selectedLogoFile);
        }
    }

    removeLogo(): void
    {
        this.selectedLogoFile = null;
        this.logoPreview = null;

        // Mark logo for deletion if it was an existing one
        if (this.hasExistingLogo)
        {
            this.deleteLogo = true;
            this.hasExistingLogo = false;
        }
    }

    // Helper to check if we should show logo preview
    hasLogoToDisplay(): boolean
    {
        return this.logoPreview !== null && !this.deleteLogo;
    }
}