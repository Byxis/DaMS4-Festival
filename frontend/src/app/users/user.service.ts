import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, of } from 'rxjs';
import { UserDto } from 'src/app/shared/types/user-dto';
import { UserResponse } from 'src/app/shared/types/user-response';

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
    return this.http.put<UserResponse>(
      `${environment.apiUrl}/users/${user.id}`,
      user,
      { withCredentials: true }
    );
  }

  createUser(user: UserDto) {
    return this.http.post<UserResponse>(
      `${environment.apiUrl}/users/invite`,
      user,
      { withCredentials: true }
    );
  }

  deleteUser(user: UserDto) {
    return this.http.delete<UserResponse>(
      `${environment.apiUrl}/users/${user.id}`,
      { withCredentials: true }
    );
  }

  

}
