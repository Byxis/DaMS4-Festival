
import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, input, signal, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {environment} from '@env/environment';

import {ZoneGameDTO} from '../../festivals/dtos/zone-game-dto';
import {FestivalService} from '../../festivals/festival-service/festival-service';
import {GameService} from '../../games/game-service/game-service';
import {GameDto} from '../../games/game/game-dto';
import {ReservationService} from '../reservation.service';
import {Reservation, ReservationGame, ReservationGameStatus} from '../reservation.type';

@Component({
    selector: 'reservation-games',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule
    ],
    templateUrl: './reservation-games.html',
    styleUrl: './reservation-games.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ReservationGamesComponent
{
    private readonly gameService = inject(GameService);
    private readonly reservationService = inject(ReservationService);
    private readonly festivalService = inject(FestivalService);

    readonly publisherId = input.required<number>();
    readonly festivalId = input.required<number>();
    readonly reservation = input.required<Reservation|undefined>();

    readonly publisherGames = signal<GameDto[]>([]);
    readonly isLoading = signal(false);

    readonly filterText = signal('');
    readonly showUndefinedOnly = signal(false);

    readonly gameStatuses = Object.values(ReservationGameStatus);

    readonly gameZones = computed<ZoneGameDTO[]>(() => {
        const fest = this.festivalService._currentFestival();
        return fest?.tarif_zones?.flatMap(tz => tz.game_zones || []) || [];
    });

    readonly reservedGamesMap = computed(() => {
        const res = this.reservation();
        const map = new Map<number, ReservationGame>();
        if (res?.games)
        {
            res.games.forEach(g => map.set(g.game_id, g));
        }
        return map;
    });

    readonly displayedGames = computed(() => {
        const allGames = this.publisherGames();
        const search = this.filterText().toLowerCase().trim();
        const showUndefined = this.showUndefinedOnly();
        const reservedMap = this.reservedGamesMap();

        return allGames.filter(game => {
            if (search && !game.name.toLowerCase().includes(search))
            {
                return false;
            }

            const reserved = reservedMap.get(game.id!);
            const hasStatus = !!(reserved && reserved.status);

            if (!showUndefined)
            {
                if (!hasStatus)
                {
                    return false;
                }
            }

            return true;
        });
    });

    constructor()
    {
        effect(() => {
            const pubId = this.publisherId();
            if (pubId)
            {
                this.isLoading.set(true);
                this.gameService.searchGameByPublisherIDInDBObservable(pubId).subscribe({
                    next: (games) => {
                        this.publisherGames.set(games);
                        this.isLoading.set(false);
                    },
                    error: (err) => {
                        console.error('Error fetching publisher games', err);
                        this.isLoading.set(false);
                    }
                });
            }
        }, {allowSignalWrites: true});
    }

    isReserved(gameId: number): boolean
    {
        return this.reservedGamesMap().has(gameId);
    }

    getGameValue(gameId: number, field: keyof ReservationGame): any
    {
        const reserved = this.reservedGamesMap().get(gameId);
        if (reserved && reserved[field] !== undefined)
        {
            return reserved[field];
        }

        if (field === 'status') return reserved?.status || null;
        return 0;
    }

    updateGameZone(gameId: number, zoneId: number)
    {
        this.updateGameValue(gameId, 'zone_id', zoneId);
    }

    updateGame(gameId: number, field: keyof ReservationGame, event: Event)
    {
        const input = event.target as HTMLInputElement;
        const value = Number(input.value);
        this.updateGameValue(gameId, field, value);
    }

    setGameStatus(gameId: number, status: string)
    {
        this.updateGameValue(gameId, 'status', status);
    }

    updateFilter(event: Event)
    {
        const input = event.target as HTMLInputElement;
        this.filterText.set(input.value);
    }

    private updateGameValue(gameId: number, field: keyof ReservationGame, value: any)
    {
        const res = this.reservation();
        if (!res) return;

        const festivalId = this.festivalId();
        const reservationId = res.id;

        const current = this.reservedGamesMap().get(gameId) || {
            game_id: gameId,
            amount: 0,
            table_count: 0,
            big_table_count: 0,
            town_table_count: 0,
            electrical_outlets: 0,
            floor_space: 0,
            status: ReservationGameStatus.ASKED
        } as ReservationGame;

        const updated: Partial<ReservationGame> = {...current, game_id: gameId, [field]: value};

        this.reservationService.upsertGame(festivalId, reservationId, updated).subscribe({
            next: (res) => {
                console.log('Game updated', res);
                this.festivalService.loadFestivalById(festivalId);
            },
            error: (err) => console.error('Error updating game', err)
        });
    }

    calculateSurface(gameId: number): number
    {
        const floorSpace = Number(this.getGameValue(gameId, 'floor_space')) || 0;

        const tStandard = Number(this.getGameValue(gameId, 'table_count')) || 0;
        const tBig = Number(this.getGameValue(gameId, 'big_table_count')) || 0;
        const tTown = Number(this.getGameValue(gameId, 'town_table_count')) || 0;

        return ((tStandard + tBig + tTown) * 4) + floorSpace;
    }

    getGameStatusLabel(status: string|null|undefined): string
    {
        if (!status) return 'Non défini';
        const map: {[key: string]: string} = {
            [ReservationGameStatus.ASKED]: 'Demandé',
            [ReservationGameStatus.CONFIRMED]: 'Confirmé',
            [ReservationGameStatus.RECEIVED]: 'Reçu',
            [ReservationGameStatus.CANCELLED]: 'Annulé',
        };
        return map[status] || status;
    }

    getGameStatusColor(status: string|null|undefined): string
    {
        if (!status) return 'var(--mat-sys-on-surface-variant)';  // Greyish for undefined/Non défini
        const map: {[key: string]: string} = {
            [ReservationGameStatus.ASKED]: 'var(--status-color-contacted)',            // Orange
            [ReservationGameStatus.CONFIRMED]: 'var(--status-color-confirmed)',        // Green
            [ReservationGameStatus.RECEIVED]: 'var(--status-color-factured)',          // Lime/Greenish
            [ReservationGameStatus.CANCELLED]: 'var(--status-color-to-be-contacted)',  // Red
        };
        return map[status] || 'inherit';
    }

    getGameStatusBackgroundColor(status: string|null|undefined): string
    {
        if (!status) return 'var(--mat-sys-surface-container-highest)';  // Neutral bg for undefined
        const color = this.getGameStatusColor(status);
        if (color === 'inherit') return 'transparent';
        if (color.startsWith('var(--'))
        {
            return `color-mix(in srgb, ${color} 12%, transparent)`;
        }
        return color;
    }
}
