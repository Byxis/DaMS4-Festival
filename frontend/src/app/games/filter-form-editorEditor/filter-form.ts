import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GameService } from '../game-service/game-service';



@Component({
  selector: 'app-filter-form-editor',
  imports: [ReactiveFormsModule, MatFormField, MatInputModule, FormsModule, MatButtonModule, MatIconButton, MatIcon],
  templateUrl: './filter-form-editor.html',
  styleUrl: './filter-form-editor.scss'
})
export class FilterFormEditor {

    readonly form = new FormGroup({
      
     
  
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

  forAnEditor = input<boolean>(false);

  // send output closeRequired, to indicate to the game-list to close the filter-form 
  // if we click on the close button
  close(): void{
    this.closeRequired.emit(true);
    this.gameService.loadAll().subscribe({
      next: games => this.gameService.setGames(games),
      error: err => console.error('loadAll failed', err)
    });
  }

  // reset the value of the form, load all the previous games before

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
  

  //send the value of the form to the gameList
  submit(): void {
    const data = this.form.value;
       this.addFilter.emit(data);
       this.submitExecuted.emit(true);
       
       
  }


}
