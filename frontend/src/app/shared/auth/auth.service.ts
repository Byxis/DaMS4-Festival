import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDto } from 'src/app/shared/types/user-dto';
import { environment } from '@env/environment';
import { catchError, finalize, of, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // --- État interne (signaux) ---
  private readonly _currentUser = signal<UserDto | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // --- État exposé (readonly, computed) ---
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() != null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isGuest = computed(() => this.currentUser()?.role === 'guest');
  readonly isPublisher = computed(() => this.currentUser()?.role === 'publisher');
  // TODO: add other roles if needed. Unsure of which are needed at the moment
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // --- Connexion ---
  login(login: string, password: string) {
    this._isLoading.set(true);
    this._error.set(null);
    this.http
      .post<{ user: UserDto }>(
        `${environment.apiUrl}/auth/login`,
        { login, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          if (res?.user) {
            this._currentUser.set(res.user);
            console.log(`👍 Utilisateur connecté : ${JSON.stringify(res.user)}`); // DEBUG
          } else {
            this._error.set('Identifiants invalides');
            this._currentUser.set(null);
          }
        }),
        catchError((err) => {
          console.error('👎 Erreur HTTP', err);
          if (err.status === 401) {
            this._error.set('Identifiants invalides');
          } else if (err.status === 0) {
            this._error.set('Serveur injoignable (vérifiez HTTPS ou CORS)');
          } else {
            this._error.set(`Erreur serveur (${err.status})`);
          }
          this._currentUser.set(null);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // --- Déconnexion ---
  logout() {
    this._isLoading.set(true);
    this._error.set(null);
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._currentUser.set(null);
        }),
        catchError((err) => {
          this._error.set('Erreur de déconnexion');
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // --- Vérifie la session actuelle (cookie httpOnly) ---
  whoami() {
    this._isLoading.set(true);
    this._error.set(null);
    this.http
      .get<{ user: UserDto }>(`${environment.apiUrl}/auth/whoami`, { withCredentials: true })
      .pipe(
        tap((res) => {
          this._currentUser.set(res?.user ?? null);
          console.log(`ℹ️ Utilisateur actuel : ${JSON.stringify(res?.user ?? null)}`); // DEBUG
        }),
        catchError((err) => {
          this._error.set('Session expirée');
          this._currentUser.set(null);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false)),
        catchError(() => of(null))
      )
      .subscribe((res) => this._currentUser.set(res?.user ?? null));
  }

  // --- Rafraîchissement pour l'interceptor ---
  refresh$() {
    // observable qui émet null en cas d'erreur
    return this.http
      .post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)));
  }

  register(login: string, password: string) {
    this._isLoading.set(true);
    this._error.set(null);
    this.http
      .post<{ user: UserDto }>(
        `${environment.apiUrl}/auth/register`,
        { login, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          if (res?.user) {
            this._currentUser.set(res.user);
            console.log(`👍 Utilisateur enregistré : ${JSON.stringify(res.user)}`); // DEBUG
          } else {
            this._error.set("Erreur lors de l'enregistrement");
            this._currentUser.set(null);
          }
        }),
        catchError((err) => {
          console.error('👎 Erreur HTTP', err);
          this._error.set("Erreur lors de l'enregistrement");
          this._currentUser.set(null);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }
}
