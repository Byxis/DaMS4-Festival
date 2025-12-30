import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint, MatError } from "@angular/material/form-field";
import { MatInput } from '@angular/material/input';
import { FestivalDto } from '../festival-dto';
import { FestivalService } from '../festival-service/festival-service';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-festival-new-form-component',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, MatError, MatHint, MatCard],
  templateUrl: './festival-new-form-component.html',
  styleUrl: './festival-new-form-component.scss'
})
export class FestivalNewFormComponent {
  festivalService = inject(FestivalService);

  //On créé un output pour notifier la création d'un festival
  readonly festivalCreated = output<void>();

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    start_date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    end_date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    big_table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    town_table_count: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] })
  });


  submit(): void {
    if (this.form.valid) {
      const newFestival = { 
        name : this.form.value.name,
        location : this.form.value.location,
        start_date : this.form.value.start_date,
        end_date : this.form.value.end_date,
        table_count : this.form.value.table_count,
        big_table_count: this.form.value.big_table_count,
        town_table_count: this.form.value.town_table_count
      };
      this.festivalService.addFestival(newFestival as Omit<FestivalDto, 'id'>);
      


      // Log the added festival details
      console.log( "Festival ajouté en frontEnd",
        {
        name: newFestival.name,
        location: newFestival.location,
        start_date: newFestival.start_date,
        end_date: newFestival.end_date,
        table_count: newFestival.table_count
      });
      this.form.reset();
    } else {
      console.error("Formulaire invalide");
    } 

    this.festivalCreated.emit();
  }
  
}
