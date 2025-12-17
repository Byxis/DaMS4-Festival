
  import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { GameDto } from '../game/game-dto';
import { map, Observable } from 'rxjs';
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

searchGameByEditorIDInDBObservable(editorID: number): Observable<GameDto[]>{
   return this.http.get<GameDto[]>(`${environment.apiUrl}/game/filterByEditorID`,{
      params:{editorID}
    });
}

  makeFilterSearchObservable(filters: {editor_name?: string,
    type? :string, 
    number_minimal_of_player? : number|null, 
    number_maximal_of_player? : number|null}): Observable<GameDto[]>{
    const params: any = {};
    if(filters.editor_name) params.editor_name = filters.editor_name;
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
  
  sortGames(order: string): void {
    this._games.update(list => {
      const copy = [...list];
      switch (order) {
         case 'name_game_asc':
          copy.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'name_game_desc':
          copy.sort((a,b) => (b.name || '').localeCompare(a.name || ''));
          break;
        case 'name_editor_asc':
          copy.sort((a,b) => (a.editor_name || '').localeCompare(b.editor_name || ''));
          break;
        case 'name_editor_desc':
          copy.sort((a,b) => (b.editor_name || '').localeCompare(a.editor_name || ''));
          break;
        case 'type_asc':
          copy.sort((a,b) => (a.type || '').localeCompare(b.type || ''));
          break;
        case 'type_desc':
          copy.sort((a,b) => (b.type || '').localeCompare(a.type || ''));
          break;
        case 'min_asc':
          copy.sort((a,b) => (a.minimum_number_of_player ?? 0) - (b.minimum_number_of_player ?? 0));
          break;
        case 'min_desc':
          copy.sort((a,b) => (b.minimum_number_of_player ?? 0) - (a.minimum_number_of_player ?? 0));
          break;
        case 'max_asc':
          copy.sort((a,b) => (a.maximum_number_of_player ?? 0) - (b.maximum_number_of_player ?? 0));
          break;
        case 'max_desc':
          copy.sort((a,b) => (b.maximum_number_of_player ?? 0) - (a.maximum_number_of_player ?? 0));
          break;
        default:
          break;
      }
      return copy;
    });
  }
  
  
  getEditorNameByIDObservable(id : number): Observable<GameDto>{
    return this.http.get<GameDto>(`${environment.apiUrl}/game/getEditorNameByID`);
  }

  getEditorNameByID(id: number): Observable<string> {
    return this.getEditorNameByIDObservable(id).pipe(
      map(res => {
        
        if (!res) return '';
        if ((res as any).name !== undefined) return (res as any).name;
        return (res as any).editor_name ?? '';
      })
    );
  }

 
 

  findById(id: number): GameDto | undefined {
    return this._games().find(g => g.id===id)
  }


     
 

}
