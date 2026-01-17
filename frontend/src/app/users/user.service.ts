import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
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
  readonly searchTerm = signal<string>('');

  readonly roleFilter = signal<string | 'all'>('all');

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();

    return this.users()
      .filter(u => {
        if (term) {
          const haystack = `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }

        if (role !== 'all' && u.role !== role) return false;

        return true;
      });
  });

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

  updateUserRole(user: UserDto, role: string) {
    return this.http.put<UserResponse>(
      `${environment.apiUrl}/users/${user.id}/role`,
      { role },
      { withCredentials: true }
    );
  }

  

}
