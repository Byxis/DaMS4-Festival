
import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {environment} from '@env/environment';
import {ContactDTO} from '@publisher/contactDto';
import {EntityDTO} from '@publisher/entityDto';
import {Observable, of, tap} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OtherService
{
    private readonly http = inject(HttpClient);

    private others = signal<EntityDTO[]>([]);
    readonly _others = this.others.asReadonly();

    private isLoadingSignal = signal<boolean>(true);
    readonly isLoading = this.isLoadingSignal.asReadonly();

    private isErrorSignal = signal<boolean>(false);
    readonly isError = this.isErrorSignal.asReadonly();

    private readonly FORCE_UPDATE: boolean = false;

    constructor()
    {
        this.loadAll();
    }

    loadAll()
    {
        this.http.get<EntityDTO[]>(`${environment.apiUrl}/others`, {withCredentials: true}).subscribe({
            next: (data) => {
                this.others.set(data);
                this.isErrorSignal.set(false);
                this.isLoadingSignal.set(false);
            },
            error: (err) => {
                console.error('Error loading others:', err);
                this.others.set([]);
                this.isErrorSignal.set(true);
                this.isLoadingSignal.set(false);
            },
        });
    }

    create(other: Partial<EntityDTO>): Observable<EntityDTO|null>
    {
        if (!other.name || other.name.trim().length === 0)
        {
            console.error('Validation Error: Name is required.');
            return of(null);
        }

        return this.http
            .post<EntityDTO>(`${environment.apiUrl}/others`, other, {
                withCredentials: true,
            })
            .pipe(tap((newOther) => {
                this.others.update((others) => [...others, newOther]);
            }));
    }

    update(id: number, other: Partial<EntityDTO>)
    {
        return this.http
            .put<EntityDTO>(`${environment.apiUrl}/others/${id}`, other, {
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
                        this.others.update((others) => {
                            const index = others.findIndex((o) => o.id === id);
                            if (index !== -1)
                            {
                                return others.map((o, i) => (i === index ? {...o, ...response} : o));
                            }
                            return others;
                        });
                    }
                },
                error: (err) => console.error('Error updating other entity:', err),
            });
    }

    delete(id: number)
    {
        return this.http.delete<void>(`${environment.apiUrl}/others/${id}`, {withCredentials: true}).subscribe({
            next: () => {
                if (this.FORCE_UPDATE)
                {
                    this.loadAll();
                }
                else
                {
                    this.others.update((others) => others.filter((o) => o.id !== id));
                }
            },
            error: (err) => console.error('Error deleting other entity:', err),
        });
    }

    addContact(entityId: number, contact: ContactDTO)
    {
        return this.http
            .post<ContactDTO>(`${environment.apiUrl}/others/${entityId}/contacts`, contact, {
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
                        this.others.update((others) => {
                            return others.map((o) => {
                                if (o.id === entityId)
                                {
                                    return {
                                        ...o,
                                        contacts: [...(o.contacts ?? []), response],
                                    };
                                }
                                return o;
                            });
                        });
                    }
                },
                error: (err) => console.error('Error adding contact:', err),
            });
    }

    removeContact(entityId: number, contactId: number)
    {
        this.http
            .delete<void>(`${environment.apiUrl}/others/${entityId}/contacts/${contactId}`, {
                withCredentials: true,
            })
            .subscribe({
                next: () => this.others.update((others) => {
                    return others.map((o) => {
                        if (o.id === entityId && o.contacts)
                        {
                            return {
                                ...o,
                                contacts: o.contacts.filter((c: ContactDTO) => c.id !== contactId),
                            };
                        }
                        return o;
                    });
                }),
                error: (err) => console.error('Error removing contact:', err),
            });
    }

    updateContact(entityId: number, contact: ContactDTO)
    {
        this.http
            .put<ContactDTO>(`${environment.apiUrl}/others/${entityId}/contacts/${contact.id}`, contact, {
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
                        this.others.update((others) => {
                            return others.map((o) => {
                                if (o.id === entityId && o.contacts)
                                {
                                    return {
                                        ...o,
                                        contacts:
                                            o.contacts.map((c: ContactDTO) => c.id === response.id ? response : c),
                                    };
                                }
                                return o;
                            });
                        });
                    }
                },
                error: (err) => console.error('Error updating contact:', err),
            });
    }
}
