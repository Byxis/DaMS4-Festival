
  import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { GameDto } from '../game/game-dto';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {




  private readonly http = inject(HttpClient);
  

  private readonly _games = signal<GameDto[]>([])
  readonly games = this._games.asReadonly()

  lastID = this.games().length;

  /*
  loadAll() : void {
    ///faire try catch
    this.http.get<GameDto[]>(this.base).subscribe(data => this._games.set(data))
  }
    */

  setGames(games: GameDto[]): void {
  this._games.set(games);
}

  deleteGame(id: number): void{
    this.removeObservable(id).subscribe({
      next: () => {
        this._games.update(list => list.filter(s => s.id !== id))
      }
      
    });
  }


  removeObservable(id: number): Observable<GameDto> {
    console.log("remove game from db")
    return this.http.delete<GameDto>(`${environment.apiUrl}/game/delete`,{
      body:{id}
    });
    
  }

  

  removeAll(): void { 
    this._games.set([]) 
  }

  update(partial: Partial<GameDto> & { id: number }): void {
    this._games.update(list =>
    list.map(g => (g.id === partial.id ? { ...g, ...partial } : g))
    )
    console.log("aaa");
  }

  

searchGameByEditorInDBObservable(editorName: string): Observable<GameDto[]>{
  return this.http.get<GameDto[]>(`${environment.apiUrl}/game/filterByEditor`,{
      params:{editorName}
    });
}

  makeFilterSearchObservable(filters: {type? :string, 
    number_minimal_of_player? : number|null, 
    number_maximal_of_player? : number|null}): Observable<GameDto[]>{
    const params: any = {};
    if(filters.type) params.type = filters.type;
  if (filters.number_minimal_of_player != null) params.min = String(filters.number_minimal_of_player);
  if (filters.number_maximal_of_player != null) params.max = String(filters.number_maximal_of_player);
  return this.http.get<GameDto[]>(`${environment.apiUrl}/game/filter`, { params });

  }

searchGameByNameInDBObservable(gameName: string): Observable<GameDto[]>{
  return this.http.get<GameDto[]>(`${environment.apiUrl}/game/search`,{
      params:{gameName}
    });
}


   addGameToDb(game: Partial<GameDto>): Observable<GameDto> {
  console.log("jeu ajouté dans la bdd");
  return this.http.post<GameDto>(`${environment.apiUrl}/game`, game);
}


  
  add(game: Partial<GameDto>): void { 
    this.addGameToDb(game).subscribe()
    
  }

   createGameFromForm(form: { name: string, editor: string, type: string, number_minimal_of_player: number, number_maximal_of_player: number }) {
  const game: Partial<GameDto> = {

    name: form.name,
    editor_name: form.editor,
    type: form.type,
    minimum_number_of_player: form.number_minimal_of_player,
    maximum_number_of_player: form.number_maximal_of_player
  };
  this.add(game);
}

  loadAll(): Observable<GameDto[]>{
    return this.http.get<GameDto[]>(`${environment.apiUrl}/game/loadAll`);
  }
  
  
  
  


 
  /*
  addGame(post: GameDto) {
     
        this.http.post<GameDto>('https://jsonplaceholder.typicode.com/posts', post).subscribe(newGame => {
        this._games.update(arr => [...arr, newGame])
        })
     }
        */


  findById(id: number): GameDto | undefined {
    return this._games().find(g => g.id===id)
  }


     
 

}
