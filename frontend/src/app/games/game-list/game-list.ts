import { Component, inject, signal, WritableSignal } from '@angular/core';
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


@Component({
  selector: 'app-game-list',
  imports: [JsonPipe, GameForm, MatFormFieldModule, MatInputModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, FilterForm],
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

  /*
    readonly posts = httpResource<PostDto[]>(() => (
       { url: 'https://jsonplaceholder.typicode.com/posts' })
    
    )*/

    setShowFormTrue(){
      this.showForm = true;
      this.showFilterForm = false;
    }

    setShowFormFalse(){
      this.showForm = false;
    }

    setFilterFormTrue(){
      this.showFilterForm = true;
      this.showForm = false;
    }

    setFilterFormFalse() {
    this.showFilterForm = false;
    
  
  }


  searchGameByEditorName(editorName: string): void {
    this.gameService.searchGameByEditorInDBObservable(editorName).subscribe({
      next: (games) => {
        this.gameService.setGames(games); 
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



  constructor() {
  this.gameService.loadAll().subscribe(games => {
    this.gameService.setGames(games); // Mets à jour le signal avec les jeux reçus
  });
}

       


}
