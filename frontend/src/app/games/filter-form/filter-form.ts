import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GameService } from '../game-service/game-service';



@Component({
  selector: 'app-filter-form',
  imports: [ReactiveFormsModule, MatFormField, MatInputModule, FormsModule, MatButtonModule, MatIconButton, MatIcon],
  templateUrl: './filter-form.html',
  styleUrl: './filter-form.scss'
})
export class FilterForm {

    readonly form = new FormGroup({
      editor_name: new FormControl('', { 
      nonNullable: false,
      validators: [ Validators.pattern('^[A-Za-z0-9 ]+$'), Validators.minLength(1)]
    }),
    type: new FormControl('', { 
      nonNullable: false,
      validators: [ Validators.pattern('[a-zA-Z ]*'), Validators.minLength(1)]
    }),
    number_minimal_of_player: new FormControl<number | null>(0, { 
      nonNullable: false,
      validators: [ Validators.pattern('[0-9 ]+$'),Validators.min(0), Validators.max(99)]
    }),

    number_maximal_of_player: new FormControl<number | null>(99, { 
      nonNullable: false,
      validators: [ Validators.pattern('[0-9 ]+$'),Validators.min(0), Validators.max(99)]
    }),
  });


  readonly gameService = inject(GameService);
  
  submitExecuted = output<boolean>();
  
  addFilter = output<any>();
  closeRequired = output<boolean>();



  close(): void{
    this.closeRequired.emit(true);
    this.gameService.loadAll().subscribe({
      next: games => this.gameService.setGames(games),
      error: err => console.error('loadAll failed', err)
    });
  }

  reset(): void {
    this.form.reset({
      type: '',
      number_minimal_of_player: 0,
      number_maximal_of_player: 99
    });

    this.gameService.loadAll().subscribe({
      next: games => this.gameService.setGames(games),
      error: err => console.error('loadAll failed', err)
    });
  }
  


  submit(): void {
    const data = this.form.value;
       this.addFilter.emit(data);
       this.submitExecuted.emit(true);
       
       
  }


}
