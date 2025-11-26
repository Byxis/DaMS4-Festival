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
}
