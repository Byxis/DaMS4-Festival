import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { PublisherDTO } from './publisherDto';
import { ContactDTO } from './contactDto';
import { MatDialog } from '@angular/material/dialog';
import { PublishersImportDialog } from './publisher-import-dialog/publisher-import-dialog';

@Injectable({
  providedIn: 'root',
})
export class PublisherService {
  private readonly http = inject(HttpClient);

  private publishers = signal<PublisherDTO[]>([]);
  readonly _publishers = this.publishers.asReadonly();

  private isLoadingSignal = signal<boolean>(true);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private isErrorSignal = signal<boolean>(false);
  readonly isError = this.isErrorSignal.asReadonly();

  private readonly FORCE_UPDATE: boolean = false;

   errorMessage = signal<string | null>(null); 
   private readonly dialog = inject(MatDialog);

    

  constructor() {
    this.loadAll();
  }

  loadAll() {
    this.http
      .get<PublisherDTO[]>(`${environment.apiUrl}/publishers`, { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (data) => {
          this.publishers.set(data);
          for (const publisher of data) {
            if (publisher.logoUrl) {
              publisher.logoUrl = `${environment.apiUrl}${publisher.logoUrl}`;
              console.log('Loaded logo URL for publisher', publisher.id, publisher.logoUrl);
            }
          }
          this.isErrorSignal.set(false);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          console.error('Error loading publishers:', err);
          this.isErrorSignal.set(true);
          this.isLoadingSignal.set(false);
        },
      });
  }

  register(publisher: PublisherDTO, logoFile?: File) {
    this.errorMessage.set(null);
    this.http
      .post<PublisherDTO>(`${environment.apiUrl}/publishers`, publisher, {
        withCredentials: true,
      })
      .subscribe({
        next: (newPublisher) => {
          this.publishers.update((publishers) => [...publishers, newPublisher]);

          if (logoFile && newPublisher.id) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            this.uploadLogo(newPublisher.id, formData);
          }
        },
        error: (err) => {
                if (err.status === 409) {
                    this.errorMessage.set('Publisher already exists');
                } else {
                    this.errorMessage.set('Error creating publisher');
                     console.log('Error message set to:', this.errorMessage()); 
                }
            },
      });
  }

  addPublisherToList(publisher: PublisherDTO) {
    this.publishers.update((publishers) => [...publishers, publisher]);
  }

  checkPublisherExists(name: string): Observable<{ 
  existsInEditors: boolean; 
  editor: any; 
  existsInPublisher: boolean;
}> {
  return this.http.get<{ 
    existsInEditors: boolean; 
    editor: any; 
    existsInPublisher: boolean;
  }>(
    `${environment.apiUrl}/publishers/check-exists/${name}`,
    { withCredentials: true }
  ).pipe(
    catchError(() => of({ 
      existsInEditors: false, 
      editor: null, 
      existsInPublisher: false 
    }))
  );
}

  update(
    publisherId: number,
    publisher: Partial<PublisherDTO>,
    logoFile?: File,
    deleteLogo?: boolean
  ) {
    return this.http
      .put<PublisherDTO>(`${environment.apiUrl}/publishers/${publisherId}`, publisher, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.update((publishers) => {
              const index = publishers.findIndex((p) => p.id === publisherId);
              if (index !== -1) {
                return publishers.map((p, i) => (i === index ? { ...p, ...response } : p));
              }
              return publishers;
            });
          }

          if (deleteLogo && publisherId) {
            this.deleteLogo(publisherId);
          }

          if (logoFile && publisherId) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            this.uploadLogo(publisherId, formData);
          }
        },
        error: (err) => console.error('Error updating publisher:', err),
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
              publisher.contacts = publisher.contacts.filter(
                (contact: ContactDTO) => contact.id !== contactId
              );
            }
            return publishers;
          }),
        error: (err) => console.error('Error removing contact:', err),
      });
  }

  updateContact(publisherId: number, contact: ContactDTO) {
    this.http
      .put<ContactDTO>(
        `${environment.apiUrl}/publishers/${publisherId}/contacts/${contact.id}`,
        contact,
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: (response) => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.update((publishers) => {
              const publisher = publishers.find((p) => p.id === publisherId);
              if (publisher && publisher.contacts) {
                const index = publisher.contacts.findIndex((c: ContactDTO) => c.id === response.id);
                if (index !== -1) {
                  publisher.contacts[index] = response;
                }
              }
              return publishers;
            });
          }
        },
        error: (err) => console.error('Error updating contact:', err),
      });
  }

  uploadLogo(publisherId: number, formData: FormData) {
    return this.http
      .post<{ url: string }>(`${environment.apiUrl}/publishers/${publisherId}/logo`, formData, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            console.log('Updating new logo');
            const timestamp = Date.now();
            this.publishers.update((publishers) => {
              const publisher = publishers.find((p) => p.id === publisherId);
              if (publisher) {
                const baseUrl = response.url || `/publishers/${publisherId}/logo`;
                publisher.logoUrl = `${environment.apiUrl}${baseUrl}${
                  baseUrl.includes('?') ? '&' : '?'
                }t=${timestamp}`;
              }
              return publishers;
            });
          }
        },
        error: (err) => console.error('Error uploading logo:', err),
      });
  }

  deleteLogo(publisherId: number) {
    return this.http
      .delete<void>(`${environment.apiUrl}/publishers/${publisherId}/logo`, {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          if (this.FORCE_UPDATE) {
            this.loadAll();
          } else {
            this.publishers.update((publishers) => {
              const publisher = publishers.find((p) => p.id === publisherId);
              if (publisher) {
                publisher.logoUrl = undefined;
              }
              return publishers;
            });
          }
        },
        error: (err) => console.error('Error deleting logo:', err),
      });
  }

  getExistingEditors() {
  return this.http.get<any[]>(
    `${environment.apiUrl}/publishers/getAllExistingPublishers`,
    { withCredentials: true }
  );
}


  importEditor(editorId: number) {
    return this.http.post(`${environment.apiUrl}/publishers/import/${editorId}`, 
      {},
      {withCredentials: true}
    );
  }

  importEditorByName(editorName: string) {
  return this.http.post(
    `${environment.apiUrl}/publishers/import-by-name`,
    { editorName },
    { withCredentials: true }
  );
}

 
}
