import { Component, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { GameService } from '../game-service/game-service';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { GameForm } from '../game-form/game-form';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilterForm } from '../filter-form/filter-form';
import { GameDto } from '../game/game-dto';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { FilterFormEditor } from '../filter-form-editorEditor/filter-form';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { MatCardTitle } from '@angular/material/card';



@Component({
  selector: 'app-game-list',
  imports: [JsonPipe, GameForm, FilterFormEditor, MatFormFieldModule,MatIconModule,MatOptionModule, MatOption,MatSelect, MatSelectModule, MatSelectModule, MatInputModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, FilterForm, MatCardTitle],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss'
})
export class GameList {

  showForm = false;
  
  showCreateForm = false;  
  showSelectForm = false;
  searchTerm = '';
  
  readonly http = inject(HttpClient)
  readonly gameService = inject(GameService)

  selectedSignal: WritableSignal<number | null> = signal(null);

  readonly route = inject(ActivatedRoute);

   isGameListForPublisher = input<boolean>(false);

   listOfGameFromPublisher = input<GameDto[]>([]);

   publisherId = input<number>();
   publisherName = input<string | undefined>(undefined);

   

  
  
  //initial sort
  orderSelection = 'name_game_asc';
  
   
    // show the newGame form
    setShowFormTrue(){
      this.showForm = true;
     
    }

    // hide the newGame form
    setShowFormFalse(){
      this.showForm = false;
    }

    // show the filter form
    setFilterFormTrue(){
      
      this.showForm = false;
    }

    

  onFormClose(closeRequested: boolean): void {
    if (closeRequested) {
      
       this.showCreateForm = false;
      console.log('Form requested close');
    }

  }


  searchGameByEditorName(editorName: string): void {
    this.gameService.searchGameByEditorInDBObservable(editorName).subscribe({
      next: (games) => {
        this.gameService.setGames(games); 
        this.gameService.sortGames(this.orderSelection);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche', err);
      }
    });
  }


  searchGameByPublisherID(publisherId: number): void {
    this.gameService.searchGameByPublisherIDInDBObservable(publisherId).subscribe({
      next: (games) => {
        this.gameService.setGames(games); 
        this.gameService.sortGames(this.orderSelection);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche', err);
      }
    });
  }

  searchGameByName(gameName: string): void {
    this.gameService.searchGameByNameInDBObservable(gameName).subscribe({
      next: (games) => {
        this.gameService.setGames(games); 
        this.gameService.sortGames(this.orderSelection);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche', err);
      }
    });
  }

   createGameFromForm(form: { name: string, editor: string, type: string, number_minimal_of_player: number, number_maximal_of_player: number }) {
    const game: Partial<GameDto> = {
  
      name: form.name,
      publisher_id: this.publisherId(),
      editor_name: form.editor,
      type: form.type,
      minimum_number_of_player: form.number_minimal_of_player,
      maximum_number_of_player: form.number_maximal_of_player
    };
    this.gameService.add(game);
     setTimeout(() => {
     if (this.isGameListForPublisher() && this.publisherId()) {
      this.searchGameByPublisherID(this.publisherId()!);
    }
    }, 500);
    this.setShowFormFalse();
  }
  


    

  makeFilterSearch(filters: any): void{
    this.gameService.makeFilterSearchObservable(filters).subscribe({
      next: (results) => {
        this.gameService.setGames(results); 
      },
      error: (err) => {
      console.error('Erreur lors de la recherche', err);
    }});

  }



  // change the order or the list
  changeOrder(order: string): void {
    this.orderSelection = order;
    
    this.gameService.sortGames(order);
  }

  constructor() {
    // ✅ Surveille publisherId et recharge quand il change
    effect(() => {
      if (this.isGameListForPublisher() && this.publisherId()) {
        this.searchGameByPublisherID(this.publisherId()!);
      }
    });
  }


  // load the list of game with all games
  // initialy : sort games by originalSort
  ngOnInit():void {
   
    if(!this.isGameListForPublisher()){

        this.gameService.loadAll().subscribe({
          next: games => {
            this.gameService.setGames(games);
            this.gameService.sortGames(this.orderSelection);
          },
          error: err => console.error('loadAll failed', err)
        });
      
      } else {
      if(this.listOfGameFromPublisher){
        this.gameService.setGames(this.listOfGameFromPublisher());
      }
    }
       
    
  };

  
    
  

       


}
