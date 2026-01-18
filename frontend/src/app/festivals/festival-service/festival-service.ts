import { inject, Injectable, signal } from '@angular/core';
import { FestivalDto } from '../dtos/festival-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';
import { ZoneTarifDTO } from '../dtos/zone-tarif-dto';
import { ZoneGameDTO } from '../dtos/zone-game-dto';

@Injectable({
  providedIn: 'root'
})

export class FestivalService {
  private readonly http = inject(HttpClient);

  // --Internal properties -- 
  private readonly FORCE_UPDATE: boolean = false;
  //List of local festivals loaded from server at startup

  private festivals = signal<FestivalDto[]>([]);
  readonly _festivals = this.festivals.asReadonly();



  // Keeping the state of the current festival 
  private currentFestival = signal<FestivalDto | null>(null);
  readonly _currentFestival = this.currentFestival.asReadonly();
  // -- Actions --


  /* ---------- FESTIVALS ---------- */

  /**
   * Load all festivals (basic info only, no zones)
   */


  loadFestivalsFromServer(): void {
    this.http.get<FestivalDto[]>(`${environment.apiUrl}/festivals`, { withCredentials: true })
      .pipe(
        tap(response => {
          // Add full logo URLs
          response.forEach(fest => {
            if (fest.logoUrl) {
              fest.logoUrl = `${environment.apiUrl}${fest.logoUrl}`;
            }
          });
          this.festivals.set(response);
        }),
        catchError(err => {
          console.error('Error loading festivals from server', err);
          return of([]);
        })
      )
      .subscribe();
  }




  /**
   * Load a specific festival by ID (with full details including zones)
   */
  loadFestivalById(id: number): void {
    this.http.get<FestivalDto>(`${environment.apiUrl}/festivals/${id}`, { withCredentials: true })
      .pipe(
        tap(response => {
          // Add full logo URL
          if (response.logoUrl) {
            response.logoUrl = `${environment.apiUrl}${response.logoUrl}`;
          }
          this.currentFestival.set(response);
        }),
        catchError(err => {
          console.error('HTTP error when loading festival', err);
          this.currentFestival.set(null);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Create a new festival
   */
  addFestival(festivalData: Omit<FestivalDto, "id">, logoFile?: File): void {
    this.http
      .post<FestivalDto>(`${environment.apiUrl}/festivals`, festivalData, {
        withCredentials: true
      })
      .pipe(
        tap(response => {
          if (response?.id) {
            console.log('Festival created with ID:', response.id);
            this.loadFestivalsFromServer();

            if (logoFile) {
              const formData = new FormData();
              formData.append('logo', logoFile);
              this.uploadLogo(response.id, formData);
            }
          }
        }),
        catchError(err => {
          console.error('HTTP error when creating festival', err);
          return of(null);
        })
      )
      .subscribe();
  }
  /**
   * Update an existing festival
   */
  updateFestival(
    festivalId: number,
    festivalData: Partial<FestivalDto>,
    logoFile?: File,
    deleteLogo?: boolean
  ): void {
    this.http
      .put<FestivalDto>(`${environment.apiUrl}/festivals/${festivalId}`, festivalData, {
        withCredentials: true,
      })
      .pipe(
        tap(response => {
          console.log('Festival updated with ID:', festivalId);

          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            this.festivals.update((festivals) =>
              festivals.map((f) => (f.id === festivalId ? { ...f, ...response } : f))
            );
          }

          // Update current festival if it's the one being edited
          if (this.currentFestival()?.id === festivalId) {
            this.loadFestivalById(festivalId);
          }

          if (deleteLogo) {
            this.deleteLogo(festivalId);
          }

          if (logoFile) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            this.uploadLogo(festivalId, formData);
          }
        }),
        catchError(err => {
          console.error('HTTP error when updating festival', err);
          return of(null);
        })
      )
      .subscribe();
  }



  /**
   * Delete a festival
   */
  removeFestival(id: number): void {
    this.http.delete<void>(`${environment.apiUrl}/festivals/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          console.log('Festival deleted with ID:', id);
          
          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            this.festivals.update((festivals) => festivals.filter((f) => f.id !== id));
          }

          // Clear current festival if it was deleted
          if (this.currentFestival()?.id === id) {
            this.currentFestival.set(null);
          }
        }),
        catchError(err => {
          console.error('HTTP error when deleting festival', err);
          return of(null);
        })
      )
      .subscribe();
  }


  /* ---------- LOGOS ---------- */

  /**
   * Upload a logo for a festival
   */
  uploadLogo(festivalId: number, formData: FormData): void {
    this.http
      .post<{ url: string }>(`${environment.apiUrl}/festivals/${festivalId}/logo`, formData, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          console.log('Logo uploaded for festival', festivalId);
          const timestamp = Date.now();
          const baseUrl = response.url || `/festivals/${festivalId}/logo`;
          const fullUrl = `${environment.apiUrl}${baseUrl}?t=${timestamp}`;

          // Update in festivals list
          this.festivals.update((festivals) =>
            festivals.map((f) => (f.id === festivalId ? { ...f, logoUrl: fullUrl } : f))
          );

          // Update current festival if applicable
          if (this.currentFestival()?.id === festivalId) {
            this.currentFestival.update((festival) =>
              festival ? { ...festival, logoUrl: fullUrl } : null
            );
          }
        }),
        catchError((err) => {
          console.error('Error uploading logo', err);
          return of(null);
        })
      )
      .subscribe();
  }



  /**
   * Delete a logo for a festival
   */
  deleteLogo(festivalId: number): void {
    this.http
      .delete<void>(`${environment.apiUrl}/festivals/${festivalId}/logo`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          console.log('Logo deleted for festival', festivalId);

          // Update in festivals list
          this.festivals.update((festivals) =>
            festivals.map((f) => (f.id === festivalId ? { ...f, logoUrl: undefined } : f))
          );

          // Update current festival if applicable
          if (this.currentFestival()?.id === festivalId) {
            this.currentFestival.update((festival) =>
              festival ? { ...festival, logoUrl: undefined } : null
            );
          }
        }),
        catchError((err) => {
          console.error('Error deleting logo', err);
          return of(null);
        })
      )
      .subscribe();
  }

 /* ---------- TARIF ZONES ---------- */
  /**
   * Add a tarif zone to a festival
   */
  addTarifZone(festivalId: number, zoneData: Omit<ZoneTarifDTO, 'id'>): void {
    this.http
      .post<ZoneTarifDTO>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones`,
        zoneData,
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          console.log('Tarif zone created:', response);
          
          // Update current festival
          if (this.currentFestival()?.id === festivalId) {
            this.currentFestival.update(festival => {
              if (!festival) return null;
              return {
                ...festival,
                tarif_zones: [...(festival.tarif_zones || []), response]
              };
            });
          }

          // Update in festivals list
          this.festivals.update(festivals =>
            festivals.map(f => {
              if (f.id === festivalId) {
                return {
                  ...f,
                  tarif_zones: [...(f.tarif_zones || []), response]
                };
              }
              return f;
            })
          );
        }),
        catchError(err => {
          console.error('Error creating tarif zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }

/**
   * Update a tarif zone
   */
  updateTarifZone(festivalId: number, tarifZoneId: number, zoneData: Partial<ZoneTarifDTO>): void {
    this.http
      .put<ZoneTarifDTO>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones/${tarifZoneId}`,
        zoneData,
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          console.log('Tarif zone updated:', response);
          
          // Update current festival
          if (this.currentFestival()?.id === festivalId) {
            this.currentFestival.update(festival => {
              if (!festival) return null;
              return {
                ...festival,
                tarif_zones: festival.tarif_zones?.map(tz =>
                  tz.id === tarifZoneId ? response : tz
                ) || []
              };
            });
          }

          // Update in festivals list
          this.festivals.update(festivals =>
            festivals.map(f => {
              if (f.id === festivalId) {
                return {
                  ...f,
                  tarif_zones: f.tarif_zones?.map(tz =>
                    tz.id === tarifZoneId ? response : tz
                  ) || []
                };
              }
              return f;
            })
          );
        }),
        catchError(err => {
          console.error('Error updating tarif zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }
  
 /**
   * Delete a tarif zone
   */
  removeTarifZone(festivalId: number, tarifZoneId: number): void {
    this.http
      .delete<void>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones/${tarifZoneId}`,
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          console.log('Tarif zone deleted:', tarifZoneId);
          
          // Update current festival
          if (this.currentFestival()?.id === festivalId) {
            this.currentFestival.update(festival => {
              if (!festival) return null;
              return {
                ...festival,
                tarif_zones: festival.tarif_zones?.filter(tz => tz.id !== tarifZoneId) || []
              };
            });
          }

          // Update in festivals list
          this.festivals.update(festivals =>
            festivals.map(f => {
              if (f.id === festivalId) {
                return {
                  ...f,
                  tarif_zones: f.tarif_zones?.filter(tz => tz.id !== tarifZoneId) || []
                };
              }
              return f;
            })
          );
        }),
        catchError(err => {
          console.error('Error deleting tarif zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }


  /* ---------- GAME ZONES ---------- */

  /**
   * Add a game zone to a tarif zone
   */
  addGameZone(
    festivalId: number,
    tarifZoneId: number,
    gameZoneData: Omit<ZoneGameDTO, 'id'>
  ): void {
    this.http
      .post<ZoneGameDTO>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones/${tarifZoneId}/game-zones`,
        gameZoneData,
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          console.log('Game zone created:', response);
          this.loadFestivalById(festivalId);
        }),
        catchError(err => {
          console.error('Error creating game zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Update a game zone
   */
  updateGameZone(
    festivalId: number,
    tarifZoneId: number,
    gameZoneId: number,
    gameZoneData: Partial<ZoneGameDTO>
  ): void {
    this.http
      .put<ZoneGameDTO>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones/${tarifZoneId}/game-zones/${gameZoneId}`,
        gameZoneData,
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          console.log('Game zone updated:', response);
          this.loadFestivalById(festivalId);
        }),
        catchError(err => {
          console.error('Error updating game zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Delete a game zone
   */
  removeGameZone(festivalId: number, tarifZoneId: number, gameZoneId: number): void {
    this.http
      .delete<void>(
        `${environment.apiUrl}/festivals/${festivalId}/tarif-zones/${tarifZoneId}/game-zones/${gameZoneId}`,
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          console.log('Game zone deleted:', gameZoneId);
          this.loadFestivalById(festivalId);
        }),
        catchError(err => {
          console.error('Error deleting game zone:', err);
          return of(null);
        })
      )
      .subscribe();
  }
}

