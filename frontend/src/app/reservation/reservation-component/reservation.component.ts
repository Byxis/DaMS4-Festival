import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PublisherService } from '@publisher/publisher.service';
import { FestivalService } from '@festivals/festival-service/festival-service';
import { ReservationService } from '../reservation.service';
import { Router } from '@angular/router';
import { Reservation, ReservationStatus } from '../reservation.type';
import { TableComponent } from '../table-component/table.component';
import { NoteComponent } from '../note-component/note.component';
import { UpdatesComponent } from '../updates-component/updates.component';
import { FactureComponent } from '../facture-component/facture.component';
@Component({
  selector: 'reservation',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    TableComponent,
    NoteComponent,
    UpdatesComponent,
    FactureComponent,
  ],
  templateUrl: './reservation.html',
  styleUrl: './reservation.scss',
})
export class ReservationComponent {
  private readonly publisherService = inject(PublisherService);
  private readonly festivalService = inject(FestivalService);
  private readonly reservationService = inject(ReservationService);
  private readonly router = inject(Router);

  readonly publisherId = input.required<number>({ alias: 'publisher' });
  readonly festivalId = input.required<number>({ alias: 'festival' });
  readonly reservationId = input<number | undefined>(undefined, { alias: 'reservation' });

  readonly publisher = computed(() => {
    const id = this.publisherId();
    return this.publisherService._publishers().find((p) => p.id === id);
  });

  readonly festival = computed(() => {
    const id = this.festivalId();
    return this.festivalService._festivals().find((f) => f.id === id);
  });

  readonly reservation = computed(() => {
    const id = this.reservationId();
    if (id) {
      return this.reservationService._reservations().find((r) => r.id === id);
    }

    const publisherId = this.publisherId();
    const festivalId = this.festivalId();
    return this.reservationService
      ._reservations()
      .find((r) => r.entity_id === publisherId && r.festival_id === festivalId);
  });

  readonly isLoading = computed(() => {
    return (
      this.publisherService.isLoading() ||
      this.festivalService.isLoading() ||
      this.reservationService.isLoading()
    );
  });

  readonly isError = computed(() => {
    return (
      this.publisherService.isError() ||
      this.festivalService.isError() ||
      this.reservationService.isError()
    );
  });

  readonly isExpanded = signal(false);
  readonly selectedStatus = signal<string>(ReservationStatus.TO_BE_CONTACTED);
  private hasLoadedReservations = signal(false);

  private lastReservationId: number | undefined;
  private lastReservationStatus: string | undefined;
  private createdReservationId: number | undefined;
  private hasAddedCreationInteraction = false;

  readonly items = signal([
    { label: 'Contacté ?', checked: false, locked: false },
    { label: 'En discussion ?', checked: false, locked: false },
    { label: 'Facturé ?', checked: false, locked: false },
    { label: 'Payé ?', checked: false, locked: false },
    { label: 'Absent', checked: false, locked: false },
  ]);

  readonly statuses = Object.values(ReservationStatus);

  readonly tableConfigs = [
    { key: 'tables_standard' as const, label: 'Tables', icon: 'table_bar' },
    { key: 'tables_large' as const, label: 'Tables grandes', icon: 'table_restaurant' },
    { key: 'tables_small' as const, label: 'Tables mairies', icon: 'desk' },
    {
      key: 'electrical_outlets' as const,
      label: 'Prises électriques',
      icon: 'electrical_services',
    },
  ];

  readonly currentStatusLabel = computed(() => {
    return this.getStatusLabel(this.selectedStatus());
  });

  readonly tableInputs = computed(() => {
    const res = this.reservation();
    return {
      tables_standard: res?.table_count ?? 0,
      tables_large: res?.big_table_count ?? 0,
      tables_small: res?.town_table_count ?? 0,
      electrical_outlets: res?.electrical_outlets ?? 0,
    };
  });

  constructor() {
    effect(() => {
      const festivalId = this.festivalId();
      if (
        festivalId &&
        this.reservationService._reservations().length == 0 &&
        !this.hasLoadedReservations() &&
        !this.reservationService.isError()
      ) {
        this.hasLoadedReservations.set(true);
        this.reservationService.loadByFestival(festivalId);
      }
    });

    effect(
      () => {
        const reservation = this.reservation();

        if (
          reservation?.id !== this.lastReservationId ||
          reservation?.status !== this.lastReservationStatus
        ) {
          this.lastReservationId = reservation?.id;
          this.lastReservationStatus = reservation?.status;

          if (reservation) {
            this.createdReservationId = reservation.id;
            this.selectedStatus.set(reservation.status);
            this.resetItemsFromStatus(reservation.status);

            if (!this.hasAddedCreationInteraction) {
              this.hasAddedCreationInteraction = true;
              this.addStatusInteraction(this.festivalId(), reservation.id, reservation.status);
            }
          } else {
            this.selectedStatus.set(ReservationStatus.TO_BE_CONTACTED);
            this.items.set([
              { label: 'Contacté ?', checked: false, locked: false },
              { label: 'En discussion ?', checked: false, locked: false },
              { label: 'Facturé ?', checked: false, locked: false },
              { label: 'Payé ?', checked: false, locked: false },
              { label: 'Absent', checked: false, locked: false },
            ]);
            this.hasAddedCreationInteraction = false;
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  toggleExpand() {
    this.isExpanded.update((v) => !v);
  }

  toggleItemCheck(index: number) {
    const items = this.items();
    items[index].checked = !items[index].checked;
    const isAbsentItem = index === items.length - 1;

    if (items[index].checked) {
      if (!isAbsentItem) {
        for (let i = 0; i < index; i++) {
          items[i].checked = true;
          items[i].locked = true;
        }
      } else {
        for (let i = 0; i < index; i++) {
          items[i].locked = true;
        }
      }
    } else {
      for (let i = index + 1; i < items.length; i++) {
        items[i].checked = false;
        items[i].locked = false;
      }

      if (!isAbsentItem) {
        if (index > 0) {
          items[index - 1].locked = false;
        }
      } else {
        for (let i = index - 1; i > 0; i--) {
          items[i].locked = false;
          if (items[i].checked === true) {
            break;
          }
        }
      }
    }

    this.items.set([...items]);

    const newStatus = this.getStatusFromItems(items);
    const previousStatus = this.selectedStatus();
    this.selectedStatus.set(newStatus);

    const reservationId = this.getActualReservationId();
    const festivalId = this.festivalId();
    const publisherId = this.publisherId();

    if (!reservationId) {
      this.reservationService.create(festivalId, {
        entity_id: publisherId,
        status: newStatus,
      });
    } else {
      this.reservationService.update(festivalId, reservationId, { status: newStatus }).subscribe({
        next: () => {
          this.addStatusInteraction(festivalId, reservationId, newStatus);
        },
        error: () => {
          this.selectedStatus.set(previousStatus);
          this.resetItemsFromStatus(previousStatus);
        },
      });
    }
  }

  private getStatusFromItems(
    items: { label: string; checked: boolean; locked: boolean }[]
  ): string {
    if (items[4].checked) return ReservationStatus.ABSENT;
    if (items[3].checked) return ReservationStatus.CONFIRMED;
    if (items[2].checked) return ReservationStatus.FACTURED;
    if (items[1].checked) return ReservationStatus.IN_DISCUSSION;
    if (items[0].checked) return ReservationStatus.CONTACTED;
    return ReservationStatus.TO_BE_CONTACTED;
  }

  private resetItemsFromStatus(status: string) {
    const itemsMap: { [key: string]: number } = {
      [ReservationStatus.CONTACTED]: 0,
      [ReservationStatus.IN_DISCUSSION]: 1,
      [ReservationStatus.FACTURED]: 2,
      [ReservationStatus.CONFIRMED]: 3,
      [ReservationStatus.ABSENT]: 4,
    };

    const checkedIndex = itemsMap[status] ?? -1;
    const newItems = this.items().map((item, index) => ({
      ...item,
      checked:
        status === ReservationStatus.ABSENT
          ? index === 4
          : index <= checkedIndex && checkedIndex !== -1,
      locked:
        status === ReservationStatus.ABSENT
          ? index < 4
          : index < checkedIndex && checkedIndex !== -1,
    }));
    this.items.set(newItems);
  }

  setStatus(status: string) {
    const previousStatus = this.selectedStatus();
    this.selectedStatus.set(status);
    this.resetItemsFromStatus(status);

    const reservationId = this.getActualReservationId();
    const festivalId = this.festivalId();
    const publisherId = this.publisherId();

    if (!reservationId) {
      this.reservationService.create(festivalId, {
        entity_id: publisherId,
        status,
      });
    } else {
      this.reservationService.update(festivalId, reservationId, { status }).subscribe({
        next: () => {
          this.addStatusInteraction(festivalId, reservationId, status);
        },
        error: () => {
          this.selectedStatus.set(previousStatus);
          this.resetItemsFromStatus(previousStatus);
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      TO_BE_CONTACTED: 'À contacter',
      CONTACTED: 'Contacté',
      IN_DISCUSSION: 'En discussion',
      FACTURED: 'Facturé',
      CONFIRMED: 'Confirmé',
      ABSENT: 'Absent',
    };
    return statusMap[status] || 'Inconnu';
  }

  private addStatusInteraction(festivalId: number, reservationId: number, status: string) {
    const description = `Statut changé en: ${this.getStatusLabel(status)}`;
    this.reservationService.addInteraction(festivalId, reservationId, description).subscribe({
      error: (err) => console.error('Error adding interaction:', err),
    });
  }

  private getActualReservationId(): number | undefined {
    const inputId = this.reservationId();
    return inputId || this.createdReservationId;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      TO_BE_CONTACTED: 'var(--status-color-to-be-contacted)',
      CONTACTED: 'var(--status-color-contacted)',
      IN_DISCUSSION: 'var(--status-color-in-discussion)',
      FACTURED: 'var(--status-color-factured)',
      CONFIRMED: 'var(--status-color-confirmed)',
      ABSENT: 'var(--status-color-absent)',
    };
    return colorMap[status] || 'inherit';
  }

  getStatusBackgroundColor(status: string): string {
    const bgColorMap: { [key: string]: string } = {
      TO_BE_CONTACTED: 'color-mix(in srgb, var(--status-color-to-be-contacted) 12%, transparent)',
      CONTACTED: 'color-mix(in srgb, var(--status-color-contacted) 12%, transparent)',
      IN_DISCUSSION: 'color-mix(in srgb, var(--status-color-in-discussion) 12%, transparent)',
      FACTURED: 'color-mix(in srgb, var(--status-color-factured) 12%, transparent)',
      CONFIRMED: 'color-mix(in srgb, var(--status-color-confirmed) 12%, transparent)',
      ABSENT: 'color-mix(in srgb, var(--status-color-absent) 12%, transparent)',
    };
    return bgColorMap[status] || 'transparent';
  }

  navigateToPublisher() {
    const id = this.publisherId();
    if (id) {
      this.router.navigate(['/publishers', id]);
    }
  }
}
