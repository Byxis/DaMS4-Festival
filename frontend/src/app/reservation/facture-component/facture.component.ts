import {CommonModule} from '@angular/common';
import {Component, computed, inject, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

import {FestivalService} from '../../festivals/festival-service/festival-service';
import type {ReservationGame} from '../reservation.type';

@Component({
    selector: 'facture',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './facture.html',
    styleUrl: './facture.scss',
})
export class FactureComponent
{
    private readonly festivalService = inject(FestivalService);

    readonly games = input.required<ReservationGame[]|undefined>();

    readonly zoneSummary = computed(() => {
        const gameList = this.games() ?? [];
        const festival = this.festivalService._currentFestival();
        const summaryMap = new Map < number,
        {
            name: string;
            surface: number;
            priceM2: number;
            outlets: number;
            priceOutlet: number;
            total: number;
        }
        > ();

        const findZoneInfo = (zoneId: number) => {
            if (!festival?.tarif_zones) return null;
            for (const tz of festival.tarif_zones)
            {
                if (tz.game_zones)
                {
                    const foundGZ = tz.game_zones.find(gz => gz.id === zoneId);
                    if (foundGZ)
                    {
                        return {tarifZone: tz, gameZone: foundGZ};
                    }
                }
            }
            return null;
        };

        const processedGames = new Set<string>();

        gameList.forEach(game => {
            if (game.zone_id)
            {
                const info = findZoneInfo(game.zone_id);
                if (info)
                {
                    const {tarifZone} = info;
                    const gameKey = `${tarifZone.id}-${game.game_id}`;

                    if (processedGames.has(gameKey)) return;
                    processedGames.add(gameKey);

                    const surface =
                        ((game.table_count ?? 0) + (game.big_table_count ?? 0) + (game.town_table_count ?? 0)) * 4 +
                        (game.floor_space ?? 0);
                    const outlets = game.electrical_outlets ?? 0;
                    const surfaceCost = surface * tarifZone.price;

                    const current = summaryMap.get(tarifZone.id!) || {
                        name: tarifZone.name,
                        surface: 0,
                        priceM2: tarifZone.price,
                        outlets: 0,
                        priceOutlet: tarifZone.electricalOutletPrice || 0,
                        total: 0
                    };

                    current.surface += surface;
                    current.outlets += outlets;
                    current.total += surfaceCost;

                    summaryMap.set(tarifZone.id!, current);
                }
            }
        });

        summaryMap.forEach((current) => {
            if (current.outlets > 0)
            {
                current.total += current.priceOutlet;
            }
        });

        const rows = Array.from(summaryMap.values());
        const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

        return {rows, grandTotal};
    });

    formatPrice(price: number): string
    {
        return new Intl
            .NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
            })
            .format(price);
    }
}
