
import {HttpClient} from '@angular/common/http';
import {computed, inject, Injectable, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Form} from '@angular/forms';
import {environment} from '@env/environment';
import {map, Observable} from 'rxjs';

import {GameDto} from '../game/game-dto';

@Injectable({providedIn: 'root'}) export class GameService
{
    private readonly http = inject(HttpClient);

    private readonly _games = signal<GameDto[]>([])
    readonly games = this._games.asReadonly()


    setGames(games: GameDto[]): void
    {
        this._games.set(games);
    }

    update(partial: Partial<GameDto>&{id: number}): Observable<GameDto>
    {
        return this.http.put<GameDto>(`${environment.apiUrl}/games/${partial.id}`, partial, {withCredentials: true});
    }

    delete(gameId: number): Observable<void>
    {
        return this.http.delete<void>(`${environment.apiUrl}/games/${gameId}`, {withCredentials: true});
    }

    searchGameByPublisherIDInDBObservable(publisherID: number): Observable<GameDto[]>
    {
        return this.http.get<GameDto[]>(`${environment.apiUrl}/games/filterByPublisherID/${publisherID}`);
    }

    makeFilterSearchObservable(filters: {
        editor_name?: string,
        type?: string,
        number_minimal_of_player?: number|null,
        number_maximal_of_player?: number|null
    }): Observable<GameDto[]>
    {
        const params: any = {};
        if (filters.editor_name) params.editor_name = filters.editor_name;
        if (filters.type) params.type = filters.type;
        if (filters.number_minimal_of_player != null) params.min = String(filters.number_minimal_of_player);
        if (filters.number_maximal_of_player != null) params.max = String(filters.number_maximal_of_player);
        return this.http.get<GameDto[]>(`${environment.apiUrl}/games/filter`, {params});
    }

    searchGameByName(gameName: string, publisherId: number): Observable<GameDto[]>
    {
        return this.http.get<GameDto[]>(
            `${environment.apiUrl}/games/search`, {params: {gameName, publisherId: publisherId.toString()}});
    }

    add(data: Partial<GameDto>&{logoFile?: File}): void
    {
        const gameData: Partial<GameDto> = {
            name: data.name,
            publisher_id: data.publisher_id,
            type: data.type,
            minimum_number_of_player: data.minimum_number_of_player,
            maximum_number_of_player: data.maximum_number_of_player,
        };
        const logo = data.logoFile || data.logo;
        this.http
            .post<GameDto>(
                `${environment.apiUrl}/publishers/addGameToPublisher`, {...gameData, logo}, {withCredentials: true})
            .subscribe({
                next: (newGame) => {
                    console.log('Jeu ajouté');

                    if (data.logoFile && newGame.id)
                    {
                        this.uploadLogo(newGame.id, data.logoFile, newGame);
                    }
                    else
                    {
                        this._games.update(games => [...games, newGame]);
                    }
                },
                error: (err) => console.error('Erreur', err)
            });
    }

    private uploadLogo(gameId: number, logoFile: File, newGame: GameDto): void
    {
        const formData = new FormData();
        formData.append('logo', logoFile);

        this.http.post(`${environment.apiUrl}/games/${gameId}/logo`, formData, {withCredentials: true}).subscribe({
            next: () => {
                console.log('Logo uploadé');
                this._games.update(games => [...games, newGame]);
            },
            error: (err) => {
                console.error('Message:', err.error?.error);
                this._games.update(games => [...games, newGame]);
            }
        });
    }

    checkPublisherGames(publisherId: number)
    {
        return this.http.get<{hasGames: boolean; gameCount: number}>(
            `${environment.apiUrl}/games/numberOfGameExisting/${publisherId}`);
    }

    checkGameNameExists(gameName: string, publisherId: number): Observable<boolean>
    {
        return this.http
            .get<{exists: boolean}>(
                `${environment.apiUrl}/games/${gameName}`, {params: {publisherId: publisherId.toString()}})
            .pipe(map(response => response.exists));
    }

    filterByEditorID(publisherId: number)
    {
        return this.http.get<GameDto[]>(`${environment.apiUrl}/games/gamesByEditorID/${publisherId}`);
    }

    getGameCountByPublisher(publisherId: number): Observable<number>
    {
        return this.http.get<{gameCount: number}>(`${environment.apiUrl}/games/numberOfPresentedGame/${publisherId}`)
            .pipe(map(response => {
                console.log(' Response from backend:', response);
                console.log(' GameCount value:', response.gameCount);
                return response.gameCount;
            }));
    }

    sortGames(order: string): void
    {
        this._games.update(list => {
            const copy = [...list];
            switch (order)
            {
                case 'name_game_asc':
                    copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    break;
                case 'name_game_desc':
                    copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                    break;
                case 'name_editor_asc':
                    copy.sort((a, b) => (a.editor_name || '').localeCompare(b.editor_name || ''));
                    break;
                case 'name_editor_desc':
                    copy.sort((a, b) => (b.editor_name || '').localeCompare(a.editor_name || ''));
                    break;
                case 'type_asc':
                    copy.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
                    break;
                case 'type_desc':
                    copy.sort((a, b) => (b.type || '').localeCompare(a.type || ''));
                    break;
                case 'min_asc':
                    copy.sort((a, b) => (a.minimum_number_of_player ?? 0) - (b.minimum_number_of_player ?? 0));
                    break;
                case 'min_desc':
                    copy.sort((a, b) => (b.minimum_number_of_player ?? 0) - (a.minimum_number_of_player ?? 0));
                    break;
                case 'max_asc':
                    copy.sort((a, b) => (a.maximum_number_of_player ?? 0) - (b.maximum_number_of_player ?? 0));
                    break;
                case 'max_desc':
                    copy.sort((a, b) => (b.maximum_number_of_player ?? 0) - (a.maximum_number_of_player ?? 0));
                    break;
                default:
                    break;
            }
            return copy;
        });
    }

    findById(id: number): GameDto|undefined
    {
        return this._games().find(g => g.id === id)
    }
}
