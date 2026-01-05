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
import { GameDto } from '../game/game-dto';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { GameSelectForm } from '../game-select-form/game-select-form';



@Component({
  selector: 'app-game-list',
  imports: [JsonPipe, GameForm,  MatFormFieldModule,MatIconModule,MatOptionModule, MatOption,MatSelect, MatSelectModule, MatSelectModule, MatInputModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatCardTitle],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss'
})
export class GameList {
  private dialog = inject(MatDialog);
  readonly http = inject(HttpClient)
  readonly gameService = inject(GameService)
   readonly route = inject(ActivatedRoute);

  showForm = false;
  showCreateForm = false;  
  showSelectForm = false;
  searchTerm = '';
  hasGames = false;

  isGameListForPublisher = input<boolean>(false);
  listOfGameFromPublisher = input<GameDto[]>([]);
  publisherId = input<number>();
  publisherName = input<string | undefined>(undefined);
  
  //initial sort
  orderSelection = 'name_game_asc';



  logoErrors = new Set<number>(); 

  onLogoError(gameId: number, event: any): void {
    this.logoErrors.add(gameId);
    event.target.style.display = 'none';
  }
    // show the newGame form
  setShowFormTrue(){
      this.showForm = true;
  }

  // hide the createNewGame form
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
  if (this.publisherId()) {
    this.gameService.searchGameByName(gameName, this.publisherId()!).subscribe({
      next: (games: GameDto[]) => {
        this.gameService.setGames(games); 
        this.gameService.sortGames(this.orderSelection);
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche', err);
      }
    });
  }
}

  checkIfPublisherHasGames() {
    const publisherId = this.publisherId();
    if (!publisherId) return;

    this.gameService.checkPublisherGames(publisherId).subscribe({
      next: (data) => {
        this.hasGames = data.hasGames;
        
      },
      error: (err) => console.error(err)
    });
  }

  changeOrder(order: string): void {
    this.orderSelection = order;
    
    this.gameService.sortGames(order);
  }

  constructor() {
    effect(() => {
      if (this.isGameListForPublisher() && this.publisherId()) {
        
        this.searchGameByPublisherID(this.publisherId()!);
        this.checkIfPublisherHasGames();
      } 
    });
  }

  openGameFormDialog(): void {
    this.dialog.open(GameForm, {
      width: '600px',
      data: {
        game: null,
        publisherId: this.publisherId(),
        publisherName: this.publisherName()
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.createGameFromForm(result);
      }
    });
  }

  openGameSelectDialog(): void {
    this.dialog.open(GameSelectForm, {
      width: '500px',
      data: {
        publisherId: this.publisherId()
      }
    }).afterClosed().subscribe(result => {
      this.addExistingGamesToPublisher(result.games);
    });
  }

  private reloadGames(): void {
    if (this.isGameListForPublisher() && this.publisherId()) {
      this.searchGameByPublisherID(this.publisherId()!);
    }
  }

  addExistingGamesToPublisher(games: any[]): void {
  if (!games || games.length === 0) return;

  games.forEach(game => {
   
    const gameData = {
      name: game.name,
      publisher_id: this.publisherId(),
      type: game.type,
      minimum_number_of_player: game.minimum_number_of_player,
      maximum_number_of_player: game.maximum_number_of_player,
      logo: game.logo || null  
    };

    console.log('Game data to add:', gameData);  
    this.gameService.add(gameData);
    
  });
   setTimeout(() => {
    this.reloadGames();
    this.gameService.sortGames(this.orderSelection);
  }, 1500);
  
}

createGameFromForm(form: { 
  name: string, 
  editor: string, 
  type: string, 
  number_minimal_of_player: number, 
  number_maximal_of_player: number, 
  logoFile?: File  
}) {
  const gameData: Partial<GameDto> & { logoFile?: File } = {
    name: form.name,
    publisher_id: this.publisherId(),
    editor_name: form.editor,
    type: form.type,
    minimum_number_of_player: form.number_minimal_of_player,
    maximum_number_of_player: form.number_maximal_of_player,
    logoFile: form.logoFile  
  };

  this.gameService.add(gameData);
  this.setShowFormFalse();
 setTimeout(() => {
    this.reloadGames();
    this.gameService.sortGames(this.orderSelection); 
  }, 1000);
  
}

}
