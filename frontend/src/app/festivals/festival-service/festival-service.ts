import { inject, Injectable, signal } from '@angular/core';
import { FestivalDto } from '../festival-dto';
import { Festival } from '../festival';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FestivalService {
  private readonly http = inject(HttpClient);

  // --Etat interne (signaux) ---

  //List of local festivals loaded from server at startup
  readonly _festivals = signal<FestivalDto[]>([]);

  // -- Actions --

  loadFestivalsFromServer(): void {
    this.http.get<FestivalDto[]>(`${environment.apiUrl}/festivals`, { withCredentials: true })
      .pipe(catchError(err => {
        console.error('👎 Erreur HTTP lors du chargement des festivals', err);
        return of([]);
      }))
      .subscribe(response => {
        this._festivals.set(response);
      });
  }



  addFestival(festivalData: Omit<FestivalDto, "id">): void {
    this.http.post<FestivalDto>(`${environment.apiUrl}/festivals`, festivalData, { withCredentials: true }).pipe(
      tap(response => {
        if (response?.id) {
          console.log(`👍 Festival créé avec l'ID : ${response.id}`);
          this.loadFestivalsFromServer();
        } else {
          console.error('👎 Réponse inattendue du serveur lors de la création du festival');
        }
      }),
      catchError(err => {
        console.error('👎 Erreur HTTP lors de la création du festival', err);
        return of(null)
      })
    ).subscribe();
  }


  removeFestival(id: number): void {
    this.http.delete<void>(`${environment.apiUrl}/festivals/${id}`, { withCredentials: true }).pipe(
      tap(response => {
        console.log(`👍 Festival supprimé avec l'ID : ${id}`);
        this.loadFestivalsFromServer();
      }),
      catchError(err => {
        console.error('👎 Erreur HTTP lors de la suppression du festival', err);
        return of(null)
      })
    ).subscribe();
  }


  findById(id: number): FestivalDto | undefined {
    return this._festivals().find(s => s.id === id);
  }

}
