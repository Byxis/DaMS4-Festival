
import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {environment} from '@env/environment';
import {map, Observable, of, switchMap, tap} from 'rxjs';

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

    private transformLogoUrls(games: GameDto[]): GameDto[]
    {
        return games.map(game => {
            if (!game.logoUrl) return game;
            if (game.logoUrl.startsWith('http://') || game.logoUrl.startsWith('https://'))
            {
                return game;
            }
            return {...game, logoUrl: `${environment.apiUrl}${game.logoUrl}`};
        });
    }

    update(partial: Partial<GameDto>&{
        id: number;
        logoFile?: File
    }): Observable<GameDto>
    {
        return this.http.put<GameDto>(`${environment.apiUrl}/games/${partial.id}`, partial, {withCredentials: true})
            .pipe(
                switchMap(updatedGame => {
                    if (partial.logoFile)
                    {
                        return this.uploadLogo(updatedGame.id!, partial.logoFile).pipe(map(() => updatedGame));
                    }
                    return of(updatedGame);
                }),
                tap(finalGame => {
                    this._games.update(games => games.map(g => {
                        if (g.id === finalGame.id)
                        {
                            if (partial.logoFile)
                            {
                                const baseUrl = `${environment.apiUrl}/games/${finalGame.id}/logo`;
                                return {...finalGame, logoUrl: `${baseUrl}?t=${Date.now()}`};
                            }
                            return finalGame;
                        }
                        return g;
                    }));
                }));
    }

    delete(gameId: number): Observable<void>
    {
        return this.http.delete<void>(`${environment.apiUrl}/games/${gameId}`, {withCredentials: true});
    }

    searchGameByPublisherIDInDBObservable(publisherID: number): Observable<GameDto[]>
    {
        return this.http.get<GameDto[]>(`${environment.apiUrl}/games/filterByPublisherID/${publisherID}`)
            .pipe(map(games => this.transformLogoUrls(games)));
    }

    add(data: Partial<GameDto>&{logoFile?: File}): Observable<GameDto>
    {
        const gameData: Partial<GameDto> = {
            name: data.name,
            publisher_id: data.publisher_id,
            type: data.type,
            minimum_number_of_player: data.minimum_number_of_player,
            maximum_number_of_player: data.maximum_number_of_player,
        };
        const logo = data.logoFile || data.logo;
        return this.http
            .post<GameDto>(
                `${environment.apiUrl}/publishers/addGameToPublisher`, {...gameData, logo}, {withCredentials: true})
            .pipe(
                switchMap(newGame => {
                    if (data.logoFile && newGame.id)
                    {
                        return this.uploadLogo(newGame.id, data.logoFile).pipe(map(() => newGame));
                    }
                    return of(newGame);
                }),
                tap(newGame => {
                    this._games.update(games => [...games, newGame]);
                }));
    }

    private uploadLogo(gameId: number, logoFile: File): Observable<any>
    {
        const formData = new FormData();
        formData.append('logo', logoFile);
        return this.http.post(`${environment.apiUrl}/games/${gameId}/logo`, formData, {withCredentials: true});
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

    filterByEditorID(publisherId: number): Observable<GameDto[]>
    {
        return this.http.get<GameDto[]>(`${environment.apiUrl}/games/gamesByEditorID/${publisherId}`)
            .pipe(map(games => this.transformLogoUrls(games)));
    }

    getGameCountByPublisher(publisherId: number): Observable<number>
    {
        return this.http.get<{gameCount: number}>(`${environment.apiUrl}/games/numberOfPresentedGame/${publisherId}`)
            .pipe(map(response => response.gameCount));
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
