import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, of } from 'rxjs';
import { ContactDTO, PublisherDTO } from './publisherDTO';

@Injectable({
  providedIn: 'root',
})
export class PublisherService {
  private readonly http = inject(HttpClient);

  private publishers = signal<PublisherDTO[]>([]);
  readonly _publishers = this.publishers.asReadonly();
  private readonly FORCE_UPDATE: boolean = false;

  constructor() {
    this.loadAll();
  }

  loadAll() {
    this.http
      .get<PublisherDTO[]>(`${environment.apiUrl}/publishers`, { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (data) => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.set(data);
          }
        },
        error: (err) => console.error('Error loading publishers:', err),
      });
  }

  register(publisher: PublisherDTO) {
    return this.http.post<PublisherDTO>(`${environment.apiUrl}/publishers`, publisher, {
      withCredentials: true,
    });
  }

  delete(publisherId: number) {
    return this.http
      .delete<void>(`${environment.apiUrl}/publishers/${publisherId}`, { withCredentials: true })
      .subscribe({
        next: () => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.update((publishers) => publishers.filter((p) => p.id !== publisherId));
          }
        },
        error: (err) => console.error('Error deleting publisher:', err),
      });
  }

  addContact(publisherId: number, contact: ContactDTO) {
    return this.http
      .post<ContactDTO>(`${environment.apiUrl}/publishers/${publisherId}/contacts`, contact, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.update((publishers) => {
              const publisher = publishers.find((p) => p.id === publisherId);
              if (publisher) {
                if (!publisher.contacts) {
                  publisher.contacts = [];
                }
                publisher.contacts.push(response);
              }
              return publishers;
            });
          }
        },
        error: (err) => console.error('Error adding contact:', err),
      });
  }

  removeContact(publisherId: number, contactId: number) {
    this.http
      .delete<void>(`${environment.apiUrl}/publishers/${publisherId}/contacts/${contactId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: () =>
          this.publishers.update((publishers) => {
            const publisher = publishers.find((p) => p.id === publisherId);
            if (publisher && publisher.contacts) {
              publisher.contacts = publisher.contacts.filter((contact) => contact.id !== contactId);
            }
            return publishers;
          }),
        error: (err) => console.error('Error removing contact:', err),
      });
  }
}
