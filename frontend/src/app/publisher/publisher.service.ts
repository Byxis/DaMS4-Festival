import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, of } from 'rxjs';
import { PublisherDto } from './publisherDto';

@Injectable({
  providedIn: 'root',
})
export class Publisher {
  private readonly http = inject(HttpClient);

  readonly publishers = signal<PublisherDto[]>([]);

  constructor() {
    this.loadAll();
  }

  loadAll() {
    this.http
      .get<PublisherDto[]>(`${environment.apiUrl}/publishers`, { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe((list: PublisherDto[]) => this.publishers.set(list));
  }

  register(publisher: PublisherDto) {
    return this.http.post<PublisherDto>(`${environment.apiUrl}/publishers`, publisher, {
      withCredentials: true,
    });
  }
}
