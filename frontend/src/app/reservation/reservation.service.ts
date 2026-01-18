import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {environment} from '@env/environment';
import {of, tap} from 'rxjs';

import type {Reservation, ReservationGame, ReservationInteraction} from './reservation.type';

@Injectable({
    providedIn: 'root',
})
export class ReservationService
{
    private readonly http = inject(HttpClient);

    private reservations = signal<Reservation[]>([]);
    readonly _reservations = this.reservations.asReadonly();

    private isLoadingSignal = signal<boolean>(false);
    readonly isLoading = this.isLoadingSignal.asReadonly();

    private isErrorSignal = signal<boolean>(false);
    readonly isError = this.isErrorSignal.asReadonly();

    private readonly FORCE_UPDATE: boolean = false;

    loadByFestival(festivalId: number)
    {
        this.isLoadingSignal.set(true);
        this.http
            .get<Reservation[]>(`${environment.apiUrl}/festivals/${festivalId}/reservations`, {
                withCredentials: true,
            })
            .subscribe({
                next: (data) => {
                    this.reservations.set(data);
                    this.isErrorSignal.set(false);
                    this.isLoadingSignal.set(false);
                },
                error: (err) => {
                    console.error('Error loading reservations:', err);
                    this.reservations.set([]);
                    this.isErrorSignal.set(true);
                    this.isLoadingSignal.set(false);
                },
            });
    }

    getById(festivalId: number, reservationId: number)
    {
        const existing = this.reservations().find((r) => r.id === reservationId);

        if (existing)
        {
            return of(existing).pipe(tap((reservation) => {
                this.http
                    .get<Reservation>(
                        `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}`,
                        {withCredentials: true})
                    .subscribe({
                        next: (updated) => {
                            this.reservations.update(
                                (reservations) => reservations.map((r) => (r.id === reservationId ? updated : r)));
                        },
                        error: (err) => console.error('Error updating reservation:', err),
                    });
            }));
        }

        return this.http
            .get<Reservation>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}`, {withCredentials: true})
            .pipe(tap((reservation) => {
                this.reservations.update((reservations) => [...reservations, reservation]);
            }));
    }

    create(festivalId: number, reservation: Partial<Reservation>)
    {
        if (!this.isValidReservation(reservation))
        {
            console.error('Validation Error: Reservation data is incomplete.');
            throw new Error('Validation Error: Reservation data is incomplete.');
        }

        return this.http
            .post<Reservation>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations`, reservation, {withCredentials: true})
            .pipe(tap((newReservation) => {
                this.reservations.update((reservations) => [...reservations, newReservation]);
            }));
    }

    private isValidReservation(reservation: Partial<Reservation>): boolean
    {
        return !!(reservation && reservation.entity_id);
    }

    update(festivalId: number, reservationId: number, reservation: Partial<Reservation>)
    {
        return this.http
            .put<Reservation>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}`,
                reservation,
                {withCredentials: true})
            .pipe(tap((response) => {
                if (this.FORCE_UPDATE)
                {
                    this.loadByFestival(festivalId);
                }
                else
                {
                    this.reservations.update((reservations) => {
                        const index = reservations.findIndex((r) => r.id === reservationId);
                        if (index !== -1)
                        {
                            return reservations.map((r, i) => (i === index ? {...r, ...response} : r));
                        }
                        return reservations;
                    });
                }
            }));
    }

    delete(festivalId: number, reservationId: number)
    {
        return this.http
            .delete<void>(`${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}`, {
                withCredentials: true,
            })
            .subscribe({
                next: () => {
                    if (this.FORCE_UPDATE)
                    {
                        this.loadByFestival(festivalId);
                    }
                    else
                    {
                        this.reservations.update((reservations) => reservations.filter((r) => r.id !== reservationId));
                    }
                },
                error: (err) => console.error('Error deleting reservation:', err),
            });
    }

    addInteraction(festivalId: number, reservationId: number, description: string)
    {
        return this.http
            .post<ReservationInteraction>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}/interactions`,
                {description},
                {withCredentials: true})
            .pipe(tap((newInteraction) => {
                this.reservations.update((reservations) => {
                    const index = reservations.findIndex((r) => r.id === reservationId);
                    if (index !== -1)
                    {
                        const reservation = reservations[index];
                        return reservations.map(
                            (r, i) => i === index ? {
                                ...r,
                                interactions: [...(r.interactions || []), newInteraction],
                            } :
                                                    r);
                    }
                    return reservations;
                });
            }));
    }
    upsertGame(festivalId: number, reservationId: number, gameData: Partial<ReservationGame>)
    {
        return this.http
            .post<ReservationGame>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}/games`,
                gameData,
                {withCredentials: true})
            .pipe(tap((updatedGame) => {
                this.reservations.update((reservations) => {
                    const index = reservations.findIndex((r) => r.id === reservationId);
                    if (index !== -1)
                    {
                        const res = reservations[index];
                        const games = res.games ? [...res.games] : [];
                        const gameIndex = games.findIndex((g) => g.game_id === updatedGame.game_id);
                        if (gameIndex !== -1)
                        {
                            games[gameIndex] = updatedGame;
                        }
                        else
                        {
                            games.push(updatedGame);
                        }
                        return reservations.map((r, i) => (i === index ? {...r, games} : r));
                    }
                    return reservations;
                });
            }));
    }

    deleteGame(festivalId: number, reservationId: number, gameId: number)
    {
        return this.http
            .delete<void>(
                `${environment.apiUrl}/festivals/${festivalId}/reservations/${reservationId}/games/${gameId}`,
                {withCredentials: true})
            .pipe(tap(() => {
                this.reservations.update((reservations) => {
                    const index = reservations.findIndex((r) => r.id === reservationId);
                    if (index !== -1)
                    {
                        const res = reservations[index];
                        const games = res.games ? res.games.filter((g) => g.game_id !== gameId) : [];
                        return reservations.map((r, i) => (i === index ? {...r, games} : r));
                    }
                    return reservations;
                });
            }));
    }
}
