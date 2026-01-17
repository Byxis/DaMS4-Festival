import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ZoneTarifDTO } from '../dtos/zone-tarif-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';
import { FestivalService } from '../festival-service/festival-service';



@Component({
  selector: 'app-zone-tarif-form-component',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule],
  templateUrl: './zone-tarif-form-component.html',
  styleUrl: './zone-tarif-form-component.scss'
})



export class ZoneTarifFormComponent {


  private readonly dialogRef = inject(MatDialogRef<ZoneTarifFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  private readonly festivalService = inject(FestivalService);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      electricalOutlet: ['', [Validators.required, Validators.min(0)]]
    });
  }
  submit(): void {
    if (this.form.invalid) return;

    const zoneData: Omit<ZoneTarifDTO, 'id'> = this.form.value;
    const festivalId = this.data.festivalId;

    // Use FestivalService to add the zone
    this.festivalService.addTarifZone(festivalId, zoneData);

    // Close dialog after submitting
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
