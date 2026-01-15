import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, of } from 'rxjs';
import { UserDto } from 'src/app/shared/types/user-dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  
  private readonly http = inject(HttpClient);

  readonly users = signal<UserDto[]>([]);

  loadAll() {
    this.http
      .get<UserDto[]>(`${environment.apiUrl}/users`, { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe((list: UserDto[]) => this.users.set(list));
  }

  editUser(user: UserDto) {
    this.http
      .put<UserDto>(`${environment.apiUrl}/users/${user.id}`, user, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          console.error('👎 Erreur HTTP', err);
          return of(null);
        })
      )
      .subscribe((updatedUser: UserDto | null) => {
        if (updatedUser) {
          const currentUsers = this.users();
          const index = currentUsers.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            currentUsers[index] = updatedUser;
            this.users.set([...currentUsers]);
          }
        }
      });
  }

  // admin created user
  createUser(user: UserDto) {
    this.http
      .post<UserDto>(`${environment.apiUrl}/users`, user, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          console.error('👎 Erreur HTTP', err);
          return of(null);
        })
      )
      .subscribe((newUser: UserDto | null) => {
        if (newUser) {
          this.users.set([...this.users(), newUser]);
        }
      });
  }

}
