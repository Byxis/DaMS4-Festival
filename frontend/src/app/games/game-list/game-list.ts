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


@Component({
  selector: 'app-game-list',
  imports: [JsonPipe, GameForm, MatFormFieldModule, MatInputModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss'
})
export class GameList {

  showForm = false;
  searchTerm = '';
  
  readonly http = inject(HttpClient)
  readonly gameService = inject(GameService)

  selectedSignal: WritableSignal<number | null> = signal(null);

  /*
    readonly posts = httpResource<PostDto[]>(() => (
       { url: 'https://jsonplaceholder.typicode.com/posts' })
    
    )*/

  onSearchGame(value : string){
    
  }

  constructor() {
  this.gameService.loadAll().subscribe(games => {
    this.gameService.setGames(games); // Mets à jour le signal avec les jeux reçus
  });
}

       


}
