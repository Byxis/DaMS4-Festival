
  import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { GameDto } from '../game/game-dto';
import { map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment';
import { Form } from '@angular/forms';

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

searchGameByPublisherIDInDBObservable(publisherID: number): Observable<GameDto[]>{
   return this.http.get<GameDto[]>(`${environment.apiUrl}/game/filterByPublisherID`,{
      params:{publisherID}
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

searchGameByName(gameName: string, publisherId: number): Observable<GameDto[]> {
  return this.http.get<GameDto[]>(`${environment.apiUrl}/game/search`, {
    params: {
      gameName,
      publisherId: publisherId.toString()
    }
  });
}


 



 


  
  add(data: Partial<GameDto> & { logoFile?: File }): void { 
  // ✅ Crée l'objet sans logoFile
  const gameData: Partial<GameDto> = {
    name: data.name,
    publisher_id: data.publisher_id,
    type: data.type,
    minimum_number_of_player: data.minimum_number_of_player,
    maximum_number_of_player: data.maximum_number_of_player,
  };

  // ✅ Gère les deux cas : logoFile (File) ou logo (URL string)
  const logo = data.logoFile || data.logo;

  this.http.post<GameDto>(
    `${environment.apiUrl}/game/addGameToPublisher`,
    { ...gameData, logo },
    { withCredentials: true }
  ).subscribe({
    next: (newGame) => {
      console.log('✅ Jeu ajouté');
      
      // ✅ Seulement upload si c'est un File (pas une URL)
      if (data.logoFile && newGame.id) {
        this.uploadLogo(newGame.id, data.logoFile);
      }
      this._games.update(games => [...games, newGame]);
    },
    error: (err) => console.error('❌ Erreur', err)
  });
}



private uploadLogo(gameId: number, logoFile: File): void {
  const formData = new FormData();
  formData.append('logo', logoFile);  

  console.log('📤 FormData avant envoi:', formData);  
  console.log('📄 Fichier:', logoFile.name, logoFile.size);  

  this.http.post(
    `${environment.apiUrl}/game/${gameId}/logo`,
    formData,
    { withCredentials: true }
  ).subscribe({
    next: () => console.log('✅ Logo uploadé'),
    error: (err) => {
      console.error('❌ Erreur logo:', err);
      console.error('Message:', err.error?.error);  
    }
  });
}
  

checkPublisherGames(publisherId: number) {
  
  return this.http.get<{ hasGames: boolean; gameCount: number }>(
    `${environment.apiUrl}/game/numberOfGameExisting/${publisherId}`
  );
}

checkGameNameExists(gameName: string, publisherId: number): Observable<boolean> {
  return this.http.get<{ exists: boolean }>(
    `${environment.apiUrl}/game/checkIfNameExists`,
    {
      params: {
        name: gameName,
        publisherId: publisherId.toString()
      }
    }
  ).pipe(
    map(response => response.exists)
  );
}


filterByEditorID(publisherId: number) {
  
  return this.http.get<GameDto[]>(
    `${environment.apiUrl}/game/gamesByEditorID/${publisherId}`
  );
}



getGameCountByPublisher(publisherId: number): Observable<number> {
  return this.http.get<{ gameCount: number }>(
    `${environment.apiUrl}/game/numberOfPresentedGame/${publisherId}`
  ).pipe(
    map(response => {
      console.log('📊 Response from backend:', response);  
      console.log('📍 GameCount value:', response.gameCount); 
      return response.gameCount;
    })
  );
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
