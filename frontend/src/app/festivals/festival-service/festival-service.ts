import { inject, Injectable, signal } from '@angular/core';
import { FestivalDto } from '../festival-dto';
import { Festival } from '../festival';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FestivalService {
  private readonly http = inject(HttpClient);

  // --Internal properties --
  private readonly FORCE_UPDATE: boolean = false;
  //List of local festivals loaded from server at startup

  private festivals = signal<FestivalDto[]>([]);
  readonly _festivals = this.festivals.asReadonly();

  private isLoadingSignal = signal<boolean>(true);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private isErrorSignal = signal<boolean>(false);
  readonly isError = this.isErrorSignal.asReadonly();

  constructor() {
    this.loadFestivalsFromServer();
  }

  // -- Actions --

  loadFestivalsFromServer(): void {
    this.http
      .get<FestivalDto[]>(`${environment.apiUrl}/festivals`, { withCredentials: true })
      .pipe(
        catchError((err) => {
          console.error('Error loading festivals from server', err);
          this.isErrorSignal.set(true);
          return of([]);
        })
      )
      .subscribe((response) => {
        this.festivals.set(response);
        this.isErrorSignal.set(false);
        this.isLoadingSignal.set(false);
        for (const fest of response) {
          if (fest.logoUrl) {
            fest.logoUrl = `${environment.apiUrl}${fest.logoUrl}`;
            console.log('Logo URL set to', fest.logoUrl, 'for festival', fest.name);
          }
        }
      });
  }

  addFestival(festivalData: Omit<FestivalDto, 'id'>, logoFile?: File): void {
    this.http
      .post<FestivalDto>(`${environment.apiUrl}/festivals`, festivalData, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response?.id) {
            console.log('Festival created with ID:', response.id);
            this.loadFestivalsFromServer();

            if (logoFile && response.id) {
              const formData = new FormData();
              formData.append('logo', logoFile);
              this.uploadLogo(response.id, formData);
            }
          } else {
            console.error('Unexpected server response when creating festival');
          }
        }),
        catchError((err) => {
          console.error('HTTP error when creating festival', err);
          return of(null);
        })
      )
      .subscribe();
  }

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
        tap((response) => {
          console.log('Festival updated with ID:', festivalId);

          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            this.festivals.update((festivals) => {
              const index = festivals.findIndex((f) => f.id === festivalId);
              if (index !== -1) {
                return festivals.map((f, i) => (i === index ? { ...f, ...response } : f));
              }
              return festivals;
            });
          }

          if (deleteLogo && festivalId) {
            this.deleteLogo(festivalId);
          }

          if (logoFile && festivalId) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            this.uploadLogo(festivalId, formData);
          }
        }),
        catchError((err) => {
          console.error('HTTP error when updating festival', err);
          return of(null);
        })
      )
      .subscribe();
  }

  removeFestival(id: number): void {
    this.http
      .delete<void>(`${environment.apiUrl}/festivals/${id}`, { withCredentials: true })
      .pipe(
        tap((response) => {
          console.log('Festival deleted with ID:', id);

          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            this.festivals.update((festivals) => festivals.filter((f) => f.id !== id));
          }
        }),
        catchError((err) => {
          console.error('HTTP error when deleting festival', err);
          return of(null);
        })
      )
      .subscribe();
  }

  loadFestivalById(id: number): void {
    this.http
      .get<FestivalDto>(`${environment.apiUrl}/festivals/${id}`, { withCredentials: true })
      .pipe(
        tap((response) => {
          console.log('Festival loaded with ID:', id, response);
        }),
        catchError((err) => {
          console.error('HTTP error when loading festival', err);
          return of(null);
        })
      )
      .subscribe();
  }

  uploadLogo(festivalId: number, formData: FormData) {
    return this.http
      .post<{ url: string }>(`${environment.apiUrl}/festivals/${festivalId}/logo`, formData, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            console.log('Updating logo for festival', festivalId);
            const timestamp = Date.now();
            this.festivals.update((festivals) => {
              const festival = festivals.find((f) => f.id === festivalId);
              if (festival) {
                const baseUrl = response.url || `/festivals/${festivalId}/logo`;
                festival.logoUrl = `${environment.apiUrl}${baseUrl}${
                  baseUrl.includes('?') ? '&' : '?'
                }t=${timestamp}`;
              }
              return festivals;
            });
          }
        },
        error: (err) => console.error('Error uploading logo', err),
      });
  }

  deleteLogo(festivalId: number) {
    return this.http
      .delete<void>(`${environment.apiUrl}/festivals/${festivalId}/logo`, {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          if (this.FORCE_UPDATE) {
            this.loadFestivalsFromServer();
          } else {
            console.log('Logo deleted for festival', festivalId);
            this.festivals.update((festivals) => {
              const festival = festivals.find((f) => f.id === festivalId);
              if (festival) {
                festival.logoUrl = undefined;
              }
              return festivals;
            });
          }
        },
        error: (err) => console.error('Error deleting logo', err),
      });
  }
}
