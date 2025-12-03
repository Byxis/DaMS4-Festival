import { Component, effect, inject, input, output, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../game-service/game-service';

@Component({
  selector: 'app-game-form',
  imports: [ReactiveFormsModule],
  templateUrl: './game-form.html',
  styleUrl: './game-form.scss'
})
export class GameForm {

  readonly form = new FormGroup({
  name: new FormControl('', { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(2)]
   }),
   editor: new FormControl('', { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(2)]
   }),
   type: new FormControl('', { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(2)]
   }),
   number_minimal_of_player: new FormControl(0, { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('[0-9]*'), Validators.minLength(1)]
   }),

   number_maximal_of_player: new FormControl(0, { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('[0-9 ]*'), Validators.minLength(1)]
   }),

  

});


 
readonly gameService = inject(GameService);

  
  

  
  addGame = output<any>();

  isSubmitFinished = output<boolean>();


  
  


  submit(): void {
    const data = this.form.value;
    
    
   
      console.log("Student creation");
       this.addGame.emit(data);
       this.form.reset();
       
  }

  





 


  getErrorMessage(control: AbstractControl|null): string|null{
    if(control){
      console.log('Control:', control);
    console.log('Errors:', control.errors);
      if(control.errors){
      if (control.errors['required']) return 'Enter a value';
      if (control.errors['minlength']) return 'Value is too short';
      if (control.errors['maxlength']) return 'Value is too long';
      if (control.errors['pattern']) return 'Invalid format';
        

      }

    }
    return null
  }
  
}


