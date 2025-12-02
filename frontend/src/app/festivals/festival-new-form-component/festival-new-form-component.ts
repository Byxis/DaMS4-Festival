import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint, MatError } from "@angular/material/form-field";
import { MatInput } from '@angular/material/input';
import { FestivalDto } from '../festival-dto';
import { FestivalService } from '../festival-service/festival-service';

@Component({
  selector: 'app-festival-new-form-component',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, MatError],
  templateUrl: './festival-new-form-component.html',
  styleUrl: './festival-new-form-component.scss'
})
export class FestivalNewFormComponent {
  festivalService = inject(FestivalService);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    startDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    endDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
  });


  submit(): void {
    if (this.form.valid) {
      const newFestival = { 
        name : this.form.value.name,
        location : this.form.value.location,
        startDate : this.form.value.startDate,
        endDate : this.form.value.endDate
      };
      this.festivalService.addFestival(newFestival as Omit<FestivalDto, 'id'>);


      // Log the added festival details
      console.log( "Festival ajouté :",
        {
        name: newFestival.name,
        location: newFestival.location,
        startDate: newFestival.startDate,
        endDate: newFestival.endDate
      });
      this.form.reset();
    } else {
      console.error("Formulaire invalide");
    }
  }
}
