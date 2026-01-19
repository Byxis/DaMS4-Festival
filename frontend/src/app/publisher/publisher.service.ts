import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '@env/environment';
import {catchError, map, Observable, of} from 'rxjs';

import {ContactDTO} from './contactDto';
import {EntityDTO} from './entityDto';
import {PublishersImportDialog} from './publisher-import-dialog/publisher-import-dialog';

@Injectable({
    providedIn: 'root',
})
export class PublisherService
{
    private readonly http = inject(HttpClient);

    private publishers = signal<EntityDTO[]>([]);
    readonly _publishers = this.publishers.asReadonly();

    private isLoadingSignal = signal<boolean>(true);
    readonly isLoading = this.isLoadingSignal.asReadonly();

    private isErrorSignal = signal<boolean>(false);
    readonly isError = this.isErrorSignal.asReadonly();

    private readonly FORCE_UPDATE: boolean = false;

    errorMessage = signal<string|null>(null);
    private readonly dialog = inject(MatDialog);



    constructor()
    {
        this.loadAll();
    }

    loadAll()
    {
        this.http.get<EntityDTO[]>(`${environment.apiUrl}/publishers`, {withCredentials: true}).subscribe({
            next: (data) => {
                for (const publisher of data)
                {
                    if (publisher.logoUrl)
                    {
                        publisher.logoUrl = `${environment.apiUrl}${publisher.logoUrl}`;
                    }
                }
                this.publishers.set(data);
                this.isErrorSignal.set(false);
                this.isLoadingSignal.set(false);
            },
            error: (err) => {
                console.error('Error loading publishers:', err);
                this.publishers.set([]);
                this.isErrorSignal.set(true);
                this.isLoadingSignal.set(false);
            },
        });
    }

    register(publisher: EntityDTO, logoFile?: File)
    {
        if (!this.isValidPublisher(publisher))
        {
            console.error('Validation Error: Publisher data is incomplete.');
            return;
        }
        this.http
            .post<EntityDTO>(`${environment.apiUrl}/publishers`, publisher, {
                withCredentials: true,
            })
            .subscribe({
                next: (newPublisher) => {
                    this.publishers.update((publishers) => [...publishers, newPublisher]);

                    if (logoFile && newPublisher.id)
                    {
                        const formData = new FormData();
                        formData.append('logo', logoFile);
                        this.uploadLogo(newPublisher.id, formData);
                    }
                },
                error: (err) => {
                    if (err.status === 409)
                    {
                        this.errorMessage.set('Publisher already exists');
                    }
                    else
                    {
                        this.errorMessage.set('Error creating publisher');
                        console.log('Error message set to:', this.errorMessage());
                    }
                },
            });
    }

    private isValidPublisher(publisher: EntityDTO): boolean
    {
        return !!(publisher && publisher.name && publisher.name.trim().length > 0);
    }

    addPublisherToList(publisher: EntityDTO)
    {
        this.publishers.update((publishers) => [...publishers, publisher]);
    }

    checkPublisherExists(name: string): Observable<{existsInEditors: boolean; editor: any; existsInPublisher: boolean;}>
    {
        return this.http
            .get<{existsInEditors: boolean; editor: any; existsInPublisher: boolean;}>(
                `${environment.apiUrl}/publishers/check-exists/${name}`, {withCredentials: true})
            .pipe(catchError(() => of({existsInEditors: false, editor: null, existsInPublisher: false})));
    }

    update(publisherId: number, publisher: Partial<EntityDTO>, logoFile?: File, deleteLogo?: boolean)
    {
        return this.http
            .put<EntityDTO>(`${environment.apiUrl}/publishers/${publisherId}`, publisher, {
                withCredentials: true,
            })
            .subscribe({
                next: (response) => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        this.publishers.update((publishers) => {
                            const index = publishers.findIndex((p) => p.id === publisherId);
                            if (index !== -1)
                            {
                                return publishers.map((p, i) => (i === index ? {...p, ...response} : p));
                            }
                            return publishers;
                        });
                    }

                    if (deleteLogo && publisherId)
                    {
                        this.deleteLogo(publisherId);
                    }

                    if (logoFile && publisherId)
                    {
                        const formData = new FormData();
                        formData.append('logo', logoFile);
                        this.uploadLogo(publisherId, formData);
                    }
                },
                error: (err) => console.error('Error updating publisher:', err),
            });
    }

    delete(publisherId: number)
    {
        return this.http.delete<void>(`${environment.apiUrl}/publishers/${publisherId}`, {withCredentials: true})
            .subscribe({
                next: () => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        this.publishers.update((publishers) => publishers.filter((p) => p.id !== publisherId));
                    }
                },
                error: (err) => console.error('Error deleting publisher:', err),
            });
    }

    addContact(publisherId: number, contact: ContactDTO)
    {
        return this.http
            .post<ContactDTO>(`${environment.apiUrl}/publishers/${publisherId}/contacts`, contact, {
                withCredentials: true,
            })
            .subscribe({
                next: (response) => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        this.publishers.update((publishers) => {
                            return publishers.map((p) => {
                                if (p.id === publisherId)
                                {
                                    return {
                                        ...p,
                                        contacts: [...(p.contacts ?? []), response],
                                    };
                                }
                                return p;
                            });
                        });
                    }
                },
                error: (err) => console.error('Error adding contact:', err),
            });
    }

    removeContact(publisherId: number, contactId: number)
    {
        this.http
            .delete<void>(`${environment.apiUrl}/publishers/${publisherId}/contacts/${contactId}`, {
                withCredentials: true,
            })
            .subscribe({
                next: () => this.publishers.update((publishers) => {
                    return publishers.map((p) => {
                        if (p.id === publisherId && p.contacts)
                        {
                            return {
                                ...p,
                                contacts: p.contacts.filter((c: ContactDTO) => c.id !== contactId),
                            };
                        }
                        return p;
                    });
                }),
                error: (err) => console.error('Error removing contact:', err),
            });
    }

    updateContact(publisherId: number, contact: ContactDTO)
    {
        this.http
            .put<ContactDTO>(`${environment.apiUrl}/publishers/${publisherId}/contacts/${contact.id}`, contact, {
                withCredentials: true,
            })
            .subscribe({
                next: (response) => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        this.publishers.update((publishers) => {
                            return publishers.map((p) => {
                                if (p.id === publisherId && p.contacts)
                                {
                                    return {
                                        ...p,
                                        contacts:
                                            p.contacts.map((c: ContactDTO) => c.id === response.id ? response : c),
                                    };
                                }
                                return p;
                            });
                        });
                    }
                },
                error: (err) => console.error('Error updating contact:', err),
            });
    }

    uploadLogo(publisherId: number, formData: FormData)
    {
        return this.http
            .post<{url: string}>(`${environment.apiUrl}/publishers/${publisherId}/logo`, formData, {
                withCredentials: true,
            })
            .subscribe({
                next: (response) => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        console.log('Updating new logo');
                        const timestamp = Date.now();
                        this.publishers.update((publishers) => {
                            const publisher = publishers.find((p) => p.id === publisherId);
                            if (publisher)
                            {
                                const baseUrl = response.url || `/publishers/${publisherId}/logo`;
                                publisher.logoUrl =
                                    `${environment.apiUrl}${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
                            }
                            return publishers;
                        });
                    }
                },
                error: (err) => console.error('Error uploading logo:', err),
            });
    }

    deleteLogo(publisherId: number)
    {
        return this.http
            .delete<void>(`${environment.apiUrl}/publishers/${publisherId}/logo`, {
                withCredentials: true,
            })
            .subscribe({
                next: () => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadAll();
                    }
                    else
                    {
                        this.publishers.update((publishers) => {
                            const publisher = publishers.find((p) => p.id === publisherId);
                            if (publisher)
                            {
                                publisher.logoUrl = undefined;
                            }
                            return publishers;
                        });
                    }
                },
                error: (err) => console.error('Error deleting logo:', err),
            });
    }

    getExistingEditors()
    {
        return this.http.get<any[]>(
            `${environment.apiUrl}/publishers/getAllExistingPublishers`, {withCredentials: true});
    }


    importEditor(editorId: number)
    {
        return this.http.post(`${environment.apiUrl}/publishers/import/${editorId}`, {}, {withCredentials: true});
    }

    importEditorByName(editorName: string)
    {
        return this.http.post(`${environment.apiUrl}/publishers/import-by-name`, {editorName}, {withCredentials: true});
    }

    getPublisherFestivals(publisherId: number): Observable<any[]>
    {
        return this.http
            .get<any[]>(`${environment.apiUrl}/publishers/${publisherId}/festivals`, {withCredentials: true})
            .pipe(map((festivals) => {
                festivals.forEach((f) => {
                    if (f.logoUrl)
                    {
                        f.logoUrl = `${environment.apiUrl}${f.logoUrl}`;
                    }
                });
                return festivals;
            }));
    }
}
