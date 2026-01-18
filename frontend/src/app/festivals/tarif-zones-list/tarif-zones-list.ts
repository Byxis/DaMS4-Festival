import {CommonModule} from '@angular/common';
import {Component, computed, inject, input, signal} from '@angular/core';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

import {ZoneTarifDTO} from '../dtos/zone-tarif-dto';
import {FestivalService} from '../festival-service/festival-service';
import {GameZoneEditDialog} from '../game-zone-edit-dialog/game-zone-edit-dialog';
import {GameZonesList} from '../game-zones-list/game-zones-list';
import {TarifZoneEditDialog} from '../tarif-zone-edit-dialog/tarif-zone-edit-dialog';

type SortColumn = 'id'|'name'|'price'|'outlets'|'gameZones';
type SortDirection = 'asc'|'desc';

import {ReservationService} from '../../reservation/reservation.service';

@Component({
    selector: 'tarif-zones-list',
    imports: [
        CommonModule,
        MatIcon,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconButton,
        MatTooltipModule,
        GameZonesList,
    ],
    templateUrl: './tarif-zones-list.html',
    styleUrl: './tarif-zones-list.scss'
})
export class TarifZonesList
{
    private readonly festivalService = inject(FestivalService);
    private readonly reservationService = inject(ReservationService);
    private readonly dialog = inject(MatDialog);

    festivalId = input.required<number>();

    readonly sortColumn = signal<SortColumn>('id');
    readonly sortDirection = signal<SortDirection>('asc');
    readonly searchTerm = signal<string>('');
    readonly expandedZoneId = signal<number|null>(null);

    readonly tarifZones = computed(() => {
        const festival = this.festivalService._currentFestival();
        if (!festival || !festival.tarif_zones) return [];

        // Calculate usage from reservations
        const reservations = this.reservationService._reservations();
        const usageMap = new Map<number, {t: number, b: number, tw: number}>();

        reservations.forEach(r => {
            r.games?.forEach(g => {
                if (g.zone_id)
                {
                    const current = usageMap.get(g.zone_id) || {t: 0, b: 0, tw: 0};
                    current.t += g.table_count || 0;
                    current.b += g.big_table_count || 0;
                    current.tw += g.town_table_count || 0;
                    usageMap.set(g.zone_id, current);
                }
            });
        });

        // Map zones with updated game zones
        let zones = festival.tarif_zones.map(
            tz => ({
                ...tz,
                game_zones: tz.game_zones?.map(gz => {
                    const usage = usageMap.get(gz.id!) || {t: 0, b: 0, tw: 0};
                    return {...gz, reserved_table: usage.t, reserved_big_table: usage.b, reserved_town_table: usage.tw};
                })
            }));

        // Filter by search term
        const term = this.searchTerm().toLowerCase().trim();
        if (term)
        {
            zones = zones.filter((z) => z.name.toLowerCase().includes(term));
        }

        // Sort
        const column = this.sortColumn();
        const direction = this.sortDirection();
        const multiplier = direction === 'asc' ? 1 : -1;

        zones.sort((a, b) => {
            let compareA: any;
            let compareB: any;

            switch (column)
            {
                case 'id':
                    compareA = a.id ?? 0;
                    compareB = b.id ?? 0;
                    break;
                case 'name':
                    compareA = a.name.toLowerCase();
                    compareB = b.name.toLowerCase();
                    break;
                case 'price':
                    compareA = a.price;
                    compareB = b.price;
                    break;
                case 'outlets':
                    compareA = a.electricalOutlet;
                    compareB = b.electricalOutlet;
                    break;
                case 'gameZones':
                    compareA = this.getGameZoneCount(a);
                    compareB = this.getGameZoneCount(b);
                    break;
            }

            if (compareA < compareB) return -1 * multiplier;
            if (compareA > compareB) return 1 * multiplier;
            return 0;
        });

        return zones;
    });

    getGameZoneCount(zone: ZoneTarifDTO): number
    {
        return zone.game_zones?.length ?? 0;
    }

    getTotalTables(zone: ZoneTarifDTO): number
    {
        if (!zone.game_zones) return 0;
        return zone.game_zones.reduce((sum, gz) => sum + (gz.reserved_table || 0), 0);
    }

    getTotalBigTables(zone: ZoneTarifDTO): number
    {
        if (!zone.game_zones) return 0;
        return zone.game_zones.reduce((sum, gz) => sum + (gz.reserved_big_table || 0), 0);
    }

    getTotalTownTables(zone: ZoneTarifDTO): number
    {
        if (!zone.game_zones) return 0;
        return zone.game_zones.reduce((sum, gz) => sum + (gz.reserved_town_table || 0), 0);
    }

    calculateSurface(zone: ZoneTarifDTO): number
    {
        // 1 table = 2m²
        const totalTables = this.getTotalTables(zone) + this.getTotalBigTables(zone) + this.getTotalTownTables(zone);
        return totalTables * 4;
    }

    toggleZone(zoneId: number): void
    {
        if (this.expandedZoneId() === zoneId)
        {
            this.expandedZoneId.set(null);
        }
        else
        {
            this.expandedZoneId.set(zoneId);
        }
    }

    sortBy(column: SortColumn): void
    {
        if (this.sortColumn() === column)
        {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        }
        else
        {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
    }

    trackByZoneId(index: number, zone: ZoneTarifDTO): number
    {
        return zone.id ?? index;
    }

    openCreateDialog(): void
    {
        const dialogRef = this.dialog.open(TarifZoneEditDialog, {
            data: {festivalId: this.festivalId(), zone: null},
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result)
            {
                this.festivalService.addTarifZone(this.festivalId(), result);
            }
        });
    }

    editZone(event: Event, zone: ZoneTarifDTO): void
    {
        event.stopPropagation();
        const dialogRef = this.dialog.open(TarifZoneEditDialog, {
            data: {festivalId: this.festivalId(), zone},
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && zone.id)
            {
                this.festivalService.updateTarifZone(this.festivalId(), zone.id, result);
            }
        });
    }

    addGameZone(event: Event, zone: ZoneTarifDTO): void
    {
        event.stopPropagation();
        const dialogRef = this.dialog.open(GameZoneEditDialog, {
            data: {festivalId: this.festivalId(), tarifZoneId: zone.id, gameZone: null},
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && zone.id)
            {
                this.festivalService.addGameZone(this.festivalId(), zone.id, result);
            }
        });
    }

    deleteZone(event: Event, zone: ZoneTarifDTO): void
    {
        event.stopPropagation();
        if (zone.id && confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`))
        {
            this.festivalService.removeTarifZone(this.festivalId(), zone.id);
        }
    }

    getSortTooltip(column: string, label: string): string
    {
        if (this.sortColumn() === column)
        {
            const direction = this.sortDirection() === 'asc' ? 'Croissant' : 'Décroissant';
            return `Trier par ${label} (${direction})`;
        }
        return `Trier par ${label}`;
    }
}