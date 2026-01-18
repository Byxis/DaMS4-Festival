import {CommonModule, DatePipe} from '@angular/common';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatOptionModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Router} from '@angular/router';
import {PublisherService} from '@publisher/publisher.service';
import {computedSorted, SortConfig} from '@shared/utils/sort.utils';
import {FestivalDto} from 'src/app/festivals/dtos/festival-dto';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';
import {TarifZonesList} from 'src/app/festivals/tarif-zones-list/tarif-zones-list';
import {ReservationComponent} from 'src/app/reservation/reservation-component/reservation.component';
import {ReservationService} from 'src/app/reservation/reservation.service';

interface FestivalItem
{
    publisher: any;
    reservation: any;
    key: {status: string; name: string; firstInteraction: string | null; lastInteraction: string | null};
}

const SORT_STRATEGIES: SortConfig<FestivalItem> = {
    NAME: (a: FestivalItem, b: FestivalItem) => a.key.name.localeCompare(b.key.name),
    STATUS: (a: FestivalItem, b: FestivalItem) => {
        const statusOrder = [
            'CONFIRMED',
            'FACTURED',
            'IN_DISCUSSION',
            'CONTACTED',
            'TO_BE_CONTACTED',
            'ABSENT',
        ];
        const idxA = statusOrder.indexOf(a.key.status);
        const idxB = statusOrder.indexOf(b.key.status);
        if (idxA === idxB) return a.key.name.localeCompare(b.key.name);
        return idxA - idxB;
    },
    STATUS_REVERSE: (a: FestivalItem, b: FestivalItem) => {
        const statusOrderReverse = [
            'TO_BE_CONTACTED',
            'CONTACTED',
            'IN_DISCUSSION',
            'FACTURED',
            'CONFIRMED',
            'ABSENT',
        ];
        const rIdxA = statusOrderReverse.indexOf(a.key.status);
        const rIdxB = statusOrderReverse.indexOf(b.key.status);
        if (rIdxA === rIdxB) return a.key.name.localeCompare(b.key.name);
        return rIdxA - rIdxB;
    },
    FIRST_INTERACTION: (a: FestivalItem, b: FestivalItem) => {
        if (a.key.firstInteraction === b.key.firstInteraction) return a.key.name.localeCompare(b.key.name);
        if (!a.key.firstInteraction) return 1;
        if (!b.key.firstInteraction) return -1;
        return a.key.firstInteraction.localeCompare(b.key.firstInteraction);
    },
    LAST_UPDATE: (a: FestivalItem, b: FestivalItem) => {
        if (a.key.lastInteraction === b.key.lastInteraction) return a.key.name.localeCompare(b.key.name);
        if (!a.key.lastInteraction) return 1;
        if (!b.key.lastInteraction) return -1;
        return b.key.lastInteraction.localeCompare(a.key.lastInteraction);
    },
};

@Component({
    selector: 'app-festival',
    imports: [
        DatePipe,
        CommonModule,
        MatCardModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        ReservationComponent,
        MatSelectModule,
        MatOptionModule,
        TarifZonesList,
    ],
    templateUrl: './festival.html',
    styleUrl: './festival.scss',
})
export class Festival
{
    id = input.required<number>();

    private readonly svc = inject(FestivalService);
    private readonly router = inject(Router);
    readonly reservationService = inject(ReservationService);
    readonly publisherService = inject(PublisherService);

    festival = this.svc._currentFestival;

    readonly sortBy = signal<'STATUS'|'STATUS_REVERSE'|'NAME'|'FIRST_INTERACTION'|'LAST_UPDATE'>('STATUS');

    readonly sortOptions = [
        {value: 'STATUS', label: 'Statut'},
        {value: 'STATUS_REVERSE', label: 'Statut (Inversé)'},
        {value: 'NAME', label: 'Nom'},
        {value: 'FIRST_INTERACTION', label: 'Première interaction'},
        {value: 'LAST_UPDATE', label: 'Dernière mise à jour'},
    ];

    readonly baseItems = computed(() => {
        const reservations = this.reservationService._reservations();
        const publishers = this.publisherService._publishers();

        return publishers.map((p) => {
            const res = reservations.find((r) => r.entity_id === p.id);
            const status = res?.status || 'TO_BE_CONTACTED';
            const name = p.name || '';
            const dates = res?.interactions?.map((i) => i.interaction_date) || [];
            dates.sort();

            const firstInteraction = dates.length > 0 ? dates[0] : null;
            const lastInteraction = dates.length > 0 ? dates[dates.length - 1] : null;

            return {publisher: p, reservation: res, key: {status, name, firstInteraction, lastInteraction}};
        });
    });

    readonly usedStock = computed(() => {
        const reservations = this.reservationService._reservations();
        let tables = 0;
        let bigTables = 0;
        let townTables = 0;

        reservations.forEach(r => {
            if (r.games)
            {
                r.games.forEach(g => {
                    tables += g.table_count || 0;
                    bigTables += g.big_table_count || 0;
                    townTables += g.town_table_count || 0;
                });
            }
        });

        return {tables, bigTables, townTables};
    });

    readonly items = computedSorted(this.baseItems, this.sortBy, SORT_STRATEGIES);

    constructor()
    {
        effect(() => {
            this.svc.loadFestivalById(this.id());
            this.reservationService.loadByFestival(this.id());
        });
    }

    editFestival(): void {}

    getDateRange(festival: FestivalDto): string
    {
        const start = new Date(festival.start_date);
        const end = new Date(festival.end_date);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
}
