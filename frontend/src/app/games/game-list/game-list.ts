import { Component, inject, input, signal, WritableSignal } from '@angular/core';
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



@Component({
  selector: 'app-game-list',
  imports: [JsonPipe, GameForm, FilterFormEditor, MatFormFieldModule,MatIconModule,MatOptionModule, MatOption,MatSelect, MatSelectModule, MatSelectModule, MatInputModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, FilterForm],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss'
})
export class GameList {

  showForm = false;
  showFilterForm = false;
  searchTerm = '';
  
  readonly http = inject(HttpClient)
  readonly gameService = inject(GameService)

  selectedSignal: WritableSignal<number | null> = signal(null);

  readonly route = inject(ActivatedRoute);
  
  //initial sort
  orderSelection = 'name_game_asc';
  
   
    // show the newGame form
    setShowFormTrue(){
      this.showForm = true;
      this.showFilterForm = false;
    }

    // hide the newGame form
    setShowFormFalse(){
      this.showForm = false;
    }

    // show the filter form
    setFilterFormTrue(){
      this.showFilterForm = true;
      this.showForm = false;
    }

    // hide the filter form
    setFilterFormFalse() {
    this.showFilterForm = false;
    
  
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

  searchGameByEditorID(editorId: number): void {
    this.gameService.searchGameByEditorIDInDBObservable(editorId).subscribe({
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


  // load the list of game with all games
  // initialy : sort games by originalSort
  constructor() {
   
   

    // 2) (optionnel) abonnement si tu veux réagir aux changements de route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const editorID = Number(id);
     
        
      
        // pas d'éditeur en param -> charger tous
        this.gameService.loadAll().subscribe({
          next: games => {
            this.gameService.setGames(games);
            this.gameService.sortGames(this.orderSelection);
          },
          error: err => console.error('loadAll failed', err)
        });
      })};
    
  

       


}
