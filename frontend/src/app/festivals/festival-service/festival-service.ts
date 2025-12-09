import { inject, Injectable, signal } from '@angular/core';
import { FestivalDto } from '../festival-dto';
import { Festival } from '../festival';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})

export class FestivalService {
  private readonly http = inject(HttpClient);



  // --Etat interne (signaux) ---
  private readonly _festivals = signal<Festival[]>([
    new Festival(1, "Sironastra", "Clermont Ferrand", new Date(2025, 9, 31), new Date(2025, 10, 4), 10, 2, 0),
    new Festival(2, "What The Fest", "Montpellier", new Date(2025, 8, 13), new Date(2025, 8, 27), 10, 2, 0),
    new Festival(3, "Negative Club", "Montpellier", new Date(2025, 8, 6), new Date(2026, 11, 30), 10, 3, 4)
  ]);


  readonly festivals = this._festivals.asReadonly(); // Contrat public : lecture seule

  readonly festivals_back = signal<FestivalDto[]>([]);

  // -- Actions --
  loadFestivalsFromServer(): void {
    this.http.get<FestivalDto[]>(`${environment.apiUrl}/festivals`, { withCredentials: true })
    .pipe(catchError(err => {
      console.error('👎 Erreur HTTP lors du chargement des festivals', err);
      return of([]);
    }))
    .subscribe(response => {
      this.festivals_back.set(response);
    });
  }

  private idCounter = this._festivals.length + 1
  //On génère le prochain ID : 
  private getNextId(): number {
    this.idCounter = this.idCounter + 1;
    return this.idCounter;
  }

  addFestival(festivalData: Omit<FestivalDto, 'id'>): void {
    // const nextId = this.getNextId();
    // const festival = new Festival(
    //   nextId,
    //   festivalData.name,
    //   festivalData.location,
    //   festivalData.start_date,
    //   festivalData.end_date,
    //   festivalData.table_count,
    //   festivalData.big_table_count,
    //   festivalData.town_table_count
    // );
    // this._festivals.update(list => [...list, festival]);
    this.sendFestivalToServer(festivalData);
  }

  private formatDateAsYMD(d: Date): string {
    // yyyy-mm-dd
    return d.toISOString().split('T')[0];
  }
  sendFestivalToServer(festivalData: Omit<FestivalDto, "id">): void {
    this.http.post<FestivalDto>(`${environment.apiUrl}/festivals`, festivalData, { withCredentials: true }).pipe(
      tap(response => {
        if (response?.id) {
          console.log(`👍 Festival créé avec l'ID : ${response.id}`);
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


  remove(id: number): void { this._festivals.update(list => list.filter(f => f.id !== id)) }


  removeAll(): void { this._festivals.set([]) }

  findById(id: number): Festival | undefined {
    return this._festivals().find(s => s.id === id);
  }

}
