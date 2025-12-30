import { Component, effect, inject, input, output, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../game-service/game-service';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-game-form',
  imports: [ReactiveFormsModule, MatFormField, MatSelectModule,MatInputModule, FormsModule, MatButtonModule, MatInputModule, MatIcon, MatOption],
  templateUrl: './game-form.html',
  styleUrl: './game-form.scss'
})
export class GameForm {

  gameTypes = [
    'Tout Public',
    'Ambiance',
    'Experts',
    'Enfants',
    'Classiques',
    'Initiés',
    'Jeu de rôle'
  ];

  readonly form = new FormGroup({
  name: new FormControl('', { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('^[A-Za-z0-9 ]+$'), Validators.minLength(1)]
   }),
   editor: new FormControl('', { 
    nonNullable: true,
    validators: [Validators.required, Validators.pattern('^[A-Za-z0-9 ]+$'), Validators.minLength(1)]
   }),
   type: new FormControl('', { 
      nonNullable: true,
      validators: [Validators.required] 
    }),
   number_minimal_of_player: new FormControl(1, { 
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), Validators.max(99)]
   }),

   number_maximal_of_player: new FormControl(1, { 
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), Validators.max(99)]
   }),

  

});


 
readonly gameService = inject(GameService);

  
  
  submitExecuted = output<boolean>();
  
  addGame = output<any>();

  publisherName = input<string | undefined>(undefined);
  isForPublisher = input<boolean>(false);

  

  closeRequired = output<boolean>();
  readonly route = inject(ActivatedRoute)
  
  


  //send the value of the form to the game-list
  // reset the value of the form after
  submit(): void {
    const data = this.form.value;

       this.addGame.emit(data);
       this.submitExecuted.emit(true);
       this.form.reset();
       
  }

  
  //reset value of the form
  resetGameForm(): void {
    this.form.reset({
      name: '',
      editor: '',
      type:'',
      number_minimal_of_player:1,
      number_maximal_of_player: 1

    });

  }

  // send the output closeRequired to the gameList
  close(): void{
    this.closeRequired.emit(true);
  }


 

  // handle error from form control
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


  editorName = "";

 constructor() {
    // ✅ Remplis le champ editor si c'est pour un publisher
    effect(() => {
      if (this.isForPublisher() && this.publisherName()) {
        this.form.get('editor')?.setValue(this.publisherName()!);
        this.form.get('editor')?.disable();  
      } else {
        this.form.get('editor')?.enable();  
      }
    });
  }

  
}


