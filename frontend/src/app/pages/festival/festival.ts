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
import {PublisherService} from '@publisher/publisher.service';
import {computedSorted, SortConfig} from '@shared/utils/sort.utils';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';
import {ZoneTarifFormComponent} from 'src/app/festivals/zone-tarif-form-component/zone-tarif-form-component';
import {ReservationComponent} from 'src/app/reservation/reservation-component/reservation.component';
import {ReservationService} from 'src/app/reservation/reservation.service';


interface FestivalItem
{
    publisher: any;
    reservation: any;
    key: {status: string; name: string; firstInteraction: string | null; lastInteraction: string | null;};
}

const SORT_STRATEGIES: SortConfig<FestivalItem> = {
    'NAME': (a: FestivalItem, b: FestivalItem) => a.key.name.localeCompare(b.key.name),
    'STATUS': (a: FestivalItem, b: FestivalItem) => {
        const statusOrder = ['TO_BE_CONTACTED', 'CONTACTED', 'IN_DISCUSSION', 'FACTURED', 'CONFIRMED', 'ABSENT'];
        const idxA = statusOrder.indexOf(a.key.status);
        const idxB = statusOrder.indexOf(b.key.status);
        if (idxA === idxB) return a.key.name.localeCompare(b.key.name);
        return idxA - idxB;
    },
    'STATUS_REVERSE': (a: FestivalItem, b: FestivalItem) => {
        const statusOrderReverse = ['CONFIRMED', 'FACTURED', 'IN_DISCUSSION', 'CONTACTED', 'TO_BE_CONTACTED', 'ABSENT'];
        const rIdxA = statusOrderReverse.indexOf(a.key.status);
        const rIdxB = statusOrderReverse.indexOf(b.key.status);
        if (rIdxA === rIdxB) return a.key.name.localeCompare(b.key.name);
        return rIdxA - rIdxB;
    },
    'FIRST_INTERACTION': (a: FestivalItem, b: FestivalItem) => {
        if (a.key.firstInteraction === b.key.firstInteraction) return a.key.name.localeCompare(b.key.name);
        if (!a.key.firstInteraction) return 1;
        if (!b.key.firstInteraction) return -1;
        return a.key.firstInteraction.localeCompare(b.key.firstInteraction);
    },
    'LAST_UPDATE': (a: FestivalItem, b: FestivalItem) => {
        if (a.key.lastInteraction === b.key.lastInteraction) return a.key.name.localeCompare(b.key.name);
        if (!a.key.lastInteraction) return 1;
        if (!b.key.lastInteraction) return -1;
        return b.key.lastInteraction.localeCompare(a.key.lastInteraction);
    }
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
    ],
    templateUrl: './festival.html',
    styleUrl: './festival.scss'
})
export class Festival
{
    id = input.required<number>();

    private readonly svc = inject(FestivalService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
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

        return publishers.map(p => {
            const res = reservations.find(r => r.entity_id === p.id);
            const status = res?.status || 'TO_BE_CONTACTED';
            const name = p.name || '';
            const dates = res?.interactions?.map(i => i.interaction_date) || [];
            dates.sort();

            const firstInteraction = dates.length > 0 ? dates[0] : null;
            const lastInteraction = dates.length > 0 ? dates[dates.length - 1] : null;

            return {publisher: p, reservation: res, key: {status, name, firstInteraction, lastInteraction}};
        });
    });

    readonly items = computedSorted(this.baseItems, this.sortBy, SORT_STRATEGIES);


    constructor()
    {
        effect(() => {
            this.svc.loadFestivalById(this.id());
            this.reservationService.loadByFestival(this.id());
        });
    }

  goBack(): void {
    this.router.navigate(['/festivals']);
  }

    // Open dialog to add new tariff zone
  openAddZoneDialog(): void {
    const dialogRef = this.dialog.open(ZoneTarifFormComponent,{
      width: '500px',
      disableClose: false,
      data: { festivalId: this.id() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload festival to show new zone
        this.svc.loadFestivalById(this.id());
      }
    });
  }

  // Helper: Format date range
  getDateRange(festival: any): string {
    if (!festival.start_date || !festival.end_date) return 'N/A';
    const start = new Date(festival.start_date).toLocaleDateString('fr-FR');
    const end = new Date(festival.end_date).toLocaleDateString('fr-FR');
    return `${start} au ${end}`;
  }

  // Helper: Get table type display name
  getTableTypeName(type: string): string {
    const names: Record<string, string> = {
      'table_count': 'Tables',
      'big_table_count': 'Grandes Tables',
      'town_table_count': 'Tables Municipales'
    };
    return names[type] || type;
  }
}
