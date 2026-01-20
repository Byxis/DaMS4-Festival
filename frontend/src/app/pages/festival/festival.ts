import {CommonModule, DatePipe} from '@angular/common';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatOptionModule} from '@angular/material/core';
import {MatDialog} from '@angular/material/dialog';
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
import {AuthService} from '@auth/auth.service';
import {OtherImportDialog} from '@other/other-import-dialog/other-import-dialog';
import {OtherNewDialog} from '@other/other-new-dialog/other-new-dialog';
import {OtherService} from '@other/other.service';
import {EntityDTO} from '@publisher/entityDto';
import {PublisherService} from '@publisher/publisher.service';
import {computedSorted, SortConfig} from '@shared/utils/sort.utils';
import {FestivalDto} from 'src/app/festivals/dtos/festival-dto';
import {FestivalNewFormComponent} from 'src/app/festivals/festival-new-form-component/festival-new-form-component';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';
import {TarifZonesList} from 'src/app/festivals/tarif-zones-list/tarif-zones-list';
import {ReservationComponent} from 'src/app/reservation/reservation-component/reservation.component';
import {ReservationService} from 'src/app/reservation/reservation.service';

interface FestivalItem
{
    entity: any;
    type: 'PUBLISHER'|'OTHER';
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
    private readonly router = inject(Router);
    private readonly svc = inject(FestivalService);
    private readonly dialog = inject(MatDialog);
    readonly reservationService = inject(ReservationService);
    readonly publisherService = inject(PublisherService);
    readonly otherService = inject(OtherService);
    readonly authService = inject(AuthService);

    id = input.required<number>();
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
        const others = this.otherService._others();

        const pubItems = publishers.map((p) => {
            const res = reservations.find((r) => r.entity_id === p.id);
            const status = res?.status || 'TO_BE_CONTACTED';
            const name = p.name || '';
            const dates = res?.interactions?.map((i) => i.interaction_date) || [];
            dates.sort();

            const firstInteraction = dates.length > 0 ? dates[0] : null;
            const lastInteraction = dates.length > 0 ? dates[dates.length - 1] : null;

            return {
                entity: p,
                type: 'PUBLISHER' as const,
                reservation: res,
                key: {status, name, firstInteraction, lastInteraction}
            };
        });

        const otherItems = others
                               .map((o) => {
                                   const res = reservations.find((r) => r.entity_id === o.id);

                                   if (!res) return null;

                                   const status = res.status || 'TO_BE_CONTACTED';
                                   const name = o.name || '';
                                   const dates = res.interactions?.map((i) => i.interaction_date) || [];
                                   dates.sort();

                                   const firstInteraction = dates.length > 0 ? dates[0] : null;
                                   const lastInteraction = dates.length > 0 ? dates[dates.length - 1] : null;

                                   return {
                                       entity: o,
                                       type: 'OTHER' as const,
                                       reservation: res,
                                       key: {status, name, firstInteraction, lastInteraction}
                                   };
                               })
                               .filter((item): item is NonNullable<typeof item> => item !== null);

        return [...pubItems, ...otherItems] as FestivalItem[];
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
    editFestival(): void
    {
        const currentFestival = this.festival();
        if (!currentFestival) return;

        const dialogRef = this.dialog.open(
            FestivalNewFormComponent,
            {width: '600px', data: {isEditing: true, festivalId: currentFestival.id, festival: currentFestival}});

        dialogRef.afterClosed().subscribe(result => {
            if (result)
            {
                this.svc.loadFestivalById(this.id());
            }
        });
    }

    getDateRange(festival: FestivalDto): string
    {
        const start = new Date(festival.start_date);
        const end = new Date(festival.end_date);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }

    addOtherEntity()
    {
        const dialogRef = this.dialog.open(OtherNewDialog, {width: '400px'});
        dialogRef.afterClosed().subscribe(name => {
            if (name)
            {
                this.otherService.create({name}).subscribe({
                    next: (newOther: EntityDTO|null) => {
                        if (newOther && newOther.id)
                        {
                            this.reservationService
                                .create(this.id(), {entity_id: newOther.id, status: 'TO_BE_CONTACTED'})
                                .subscribe();
                        }
                    }
                });
            }
        });
    }

    importOtherEntity()
    {
        const currentReservations = this.reservationService._reservations();
        const excludedIds = currentReservations.filter(r => r.entity_id !== undefined).map(r => r.entity_id!);

        const dialogRef = this.dialog.open(OtherImportDialog, {width: '400px', data: {excludedIds: excludedIds}});

        dialogRef.afterClosed().subscribe((other: EntityDTO|null) => {
            if (other && other.id)
            {
                this.reservationService.create(this.id(), {entity_id: other.id, status: 'TO_BE_CONTACTED'}).subscribe({
                    error: (err) => console.error('Error creating reservation', err)
                });
            }
        });
    }

    updateSurface(type: 'table_surface'|'big_table_surface'|'town_table_surface', event: Event)
    {
        const input = event.target as HTMLInputElement;
        const val = parseFloat(input.value);
        if (isNaN(val) || val < 0) return;

        this.svc.updateFestival(this.id(), {[type]: val});
    }
}
