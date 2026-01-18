import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {Router} from '@angular/router';
import {FestivalService} from '@festivals/festival-service/festival-service';
import {OtherService} from '@other/other.service';
import {PublisherService} from '@publisher/publisher.service';

import {FactureComponent} from '../facture-component/facture.component';
import {NoteComponent} from '../note-component/note.component';
import {ReservationGamesComponent} from '../reservation-games-component/reservation-games.component';
import {ReservationService} from '../reservation.service';
import {Reservation, ReservationStatus} from '../reservation.type';
import {TableComponent} from '../table-component/table.component';
import {UpdatesComponent} from '../updates-component/updates.component';

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
        ReservationGamesComponent,
    ],
    templateUrl: './reservation.html',
    styleUrl: './reservation.scss',
})
export class ReservationComponent
{
    private readonly publisherService = inject(PublisherService);
    private readonly otherService = inject(OtherService);
    private readonly festivalService = inject(FestivalService);
    private readonly reservationService = inject(ReservationService);
    private readonly router = inject(Router);

    readonly entityId = input.required<number>();
    readonly entityType = input<'PUBLISHER'|'OTHER'>('PUBLISHER');
    readonly festivalId = input.required<number>();
    readonly reservationId = input<number|undefined>(undefined);

    readonly entity = computed(() => {
        const id = this.entityId();
        if (this.entityType() === 'PUBLISHER')
        {
            return this.publisherService._publishers().find((p) => p.id === id);
        }
        else
        {
            return this.otherService._others().find((o) => o.id === id);
        }
    });

    readonly festival = computed(() => {
        const id = this.festivalId();
        return this.festivalService._festivals().find((f) => f.id === id);
    });

    readonly reservation = computed(() => {
        const id = this.reservationId();
        if (id)
        {
            return this.reservationService._reservations().find((r) => r.id === id);
        }

        const entityId = this.entityId();
        const festivalId = this.festivalId();
        return this.reservationService._reservations().find(
            (r) => r.entity_id === entityId && r.festival_id === festivalId);
    });

    readonly isLoading = computed(() => {
        return (
            this.publisherService.isLoading() || this.otherService.isLoading() || this.festivalService.isLoading() ||
            this.reservationService.isLoading());
    });

    readonly isError = computed(() => {
        return (
            this.publisherService.isError() || this.otherService.isError() || this.festivalService.isError() ||
            this.reservationService.isError());
    });

    readonly isExpanded = signal(false);
    readonly selectedStatus = signal<string>(ReservationStatus.TO_BE_CONTACTED);
    private hasLoadedReservations = signal(false);

    private lastReservationId: number|undefined;
    private lastReservationStatus: string|undefined;
    private lastEntityId: number|undefined;
    private createdReservationId: number|undefined;

    readonly items = signal([
        {label: 'Contacté ?', checked: false, locked: false},
        {label: 'En discussion ?', checked: false, locked: false},
        {label: 'Facturé ?', checked: false, locked: false},
        {label: 'Payé ?', checked: false, locked: false},
        {label: 'Absent', checked: false, locked: false},
    ]);

    readonly statuses = Object.values(ReservationStatus);

    readonly tableConfigs = [
        {key: 'tables_standard' as const, label: 'Tables', icon: 'table_bar'},
        {key: 'tables_large' as const, label: 'Tables grandes', icon: 'table_restaurant'},
        {key: 'tables_small' as const, label: 'Tables mairies', icon: 'desk'},
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

    readonly tableWarnings = computed(() => {
        const res = this.reservation();
        if (!res) return [];

        const assigned = {tables_standard: 0, tables_large: 0, tables_small: 0};

        if (res.games)
        {
            res.games.forEach(g => {
                assigned.tables_standard += g.table_count || 0;
                assigned.tables_large += g.big_table_count || 0;
                assigned.tables_small += g.town_table_count || 0;
            });
        }

        const warnings: string[] = [];

        const checkStock = (reserved: number, assignedCount: number, label: string) => {
            if (reserved > assignedCount)
            {
                warnings.push(
                    `Toutes les ${label.toLowerCase()} n'ont pas été attribuées : ${assignedCount}/${reserved}`);
            }
            else if (reserved < assignedCount)
            {
                warnings.push(`Trop de ${label.toLowerCase()} attribuées : ${assignedCount}/${reserved}`);
            }
        };

        checkStock(res.table_count || 0, assigned.tables_standard, 'Tables');
        checkStock(res.big_table_count || 0, assigned.tables_large, 'Tables grandes');
        checkStock(res.town_table_count || 0, assigned.tables_small, 'Tables mairies');

        return warnings;
    });

    constructor()
    {
        effect(() => {
            const festivalId = this.festivalId();
            if (festivalId && this.reservationService._reservations().length == 0 && !this.hasLoadedReservations() &&
                !this.reservationService.isError())
            {
                this.hasLoadedReservations.set(true);
                this.reservationService.loadByFestival(festivalId);
            }
        });

        effect(() => {
            const reservation = this.reservation();
            const entityId = this.entityId();

            if (reservation?.id !== this.lastReservationId || reservation?.status !== this.lastReservationStatus ||
                entityId !== this.lastEntityId)
            {
                this.lastReservationId = reservation?.id;
                this.lastReservationStatus = reservation?.status;
                this.lastEntityId = entityId;

                if (reservation)
                {
                    this.createdReservationId = reservation.id;
                    this.selectedStatus.set(reservation.status);
                    this.resetItemsFromStatus(reservation.status);
                }
                else
                {
                    this.selectedStatus.set(ReservationStatus.TO_BE_CONTACTED);
                    this.items.set([
                        {label: 'Contacté ?', checked: false, locked: false},
                        {label: 'En discussion ?', checked: false, locked: false},
                        {label: 'Facturé ?', checked: false, locked: false},
                        {label: 'Payé ?', checked: false, locked: false},
                        {label: 'Absent', checked: false, locked: false},
                    ]);
                }
            }
        }, {allowSignalWrites: true});
    }

    toggleExpand()
    {
        this.isExpanded.update((v) => !v);
    }

    toggleItemCheck(index: number)
    {
        const items = this.items();
        items[index].checked = !items[index].checked;
        const isAbsentItem = index === items.length - 1;

        if (items[index].checked)
        {
            if (!isAbsentItem)
            {
                for (let i = 0; i < index; i++)
                {
                    items[i].checked = true;
                    items[i].locked = true;
                }
            }
            else
            {
                for (let i = 0; i < index; i++)
                {
                    items[i].locked = true;
                }
            }
        }
        else
        {
            for (let i = index + 1; i < items.length; i++)
            {
                items[i].checked = false;
                items[i].locked = false;
            }

            if (!isAbsentItem)
            {
                if (index > 0)
                {
                    items[index - 1].locked = false;
                }
            }
            else
            {
                for (let i = index - 1; i > 0; i--)
                {
                    items[i].locked = false;
                    if (items[i].checked === true)
                    {
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
        const entityId = this.entityId();

        if (!reservationId)
        {
            this.reservationService
                .create(festivalId, {
                    entity_id: entityId,
                    status: newStatus,
                })
                .subscribe((newRes) => {
                    this.addStatusInteraction(festivalId, newRes.id, newRes.status);
                });
        }
        else
        {
            console.log('Updating status to', newStatus);
            this.reservationService.update(festivalId, reservationId, {status: newStatus}).subscribe({
                next: () => {
                    console.log('Adding status interaction');
                    this.addStatusInteraction(festivalId, reservationId, newStatus);
                },
                error: () => {
                    console.error('Error updating status');
                    this.selectedStatus.set(previousStatus);
                    this.resetItemsFromStatus(previousStatus);
                },
            });
        }
    }

    private getStatusFromItems(items: {label: string; checked: boolean; locked: boolean}[]): string
    {
        if (items[4].checked) return ReservationStatus.ABSENT;
        if (items[3].checked) return ReservationStatus.CONFIRMED;
        if (items[2].checked) return ReservationStatus.FACTURED;
        if (items[1].checked) return ReservationStatus.IN_DISCUSSION;
        if (items[0].checked) return ReservationStatus.CONTACTED;
        return ReservationStatus.TO_BE_CONTACTED;
    }

    private resetItemsFromStatus(status: string)
    {
        const itemsMap: {[key: string]: number} = {
            [ReservationStatus.CONTACTED]: 0,
            [ReservationStatus.IN_DISCUSSION]: 1,
            [ReservationStatus.FACTURED]: 2,
            [ReservationStatus.CONFIRMED]: 3,
            [ReservationStatus.ABSENT]: 4,
        };

        const checkedIndex = itemsMap[status] ?? -1;
        const newItems = this.items().map(
            (item, index) => ({
                ...item,
                checked: status === ReservationStatus.ABSENT ? index === 4 :
                                                               index <= checkedIndex && checkedIndex !== -1,
                locked: status === ReservationStatus.ABSENT ? index < 4 : index < checkedIndex && checkedIndex !== -1,
            }));
        this.items.set(newItems);
    }

    setStatus(status: string)
    {
        const previousStatus = this.selectedStatus();
        this.selectedStatus.set(status);
        this.resetItemsFromStatus(status);

        const reservationId = this.getActualReservationId();
        const festivalId = this.festivalId();
        const entityId = this.entityId();
        console.log('reservationId', reservationId);

        if (!reservationId)
        {
            this.reservationService
                .create(festivalId, {
                    entity_id: entityId,
                    status,
                })
                .subscribe((newRes) => {
                    this.addStatusInteraction(festivalId, newRes.id, newRes.status);
                });
        }
        else
        {
            console.log('Updating status to', status);
            this.reservationService.update(festivalId, reservationId, {status}).subscribe({
                next: () => {
                    console.log('Adding status interaction');
                    this.addStatusInteraction(festivalId, reservationId, status);
                },
                error: () => {
                    console.error('Error updating status');
                    this.selectedStatus.set(previousStatus);
                    this.resetItemsFromStatus(previousStatus);
                },
            });
        }
    }

    getStatusLabel(status: string): string
    {
        const statusMap: {[key: string]: string} = {
            TO_BE_CONTACTED: 'À contacter',
            CONTACTED: 'Contacté',
            IN_DISCUSSION: 'En discussion',
            FACTURED: 'Facturé',
            CONFIRMED: 'Confirmé',
            ABSENT: 'Absent',
        };
        return statusMap[status] || 'Inconnu';
    }

    private addStatusInteraction(festivalId: number, reservationId: number, status: string)
    {
        const description = `Statut changé en: ${this.getStatusLabel(status)}`;
        this.reservationService.addInteraction(festivalId, reservationId, description).subscribe({
            error: (err) => console.error('Error adding interaction:', err),
        });
    }

    private getActualReservationId(): number|undefined
    {
        const inputId = this.reservationId();
        return inputId || this.createdReservationId;
    }

    getStatusColor(status: string): string
    {
        const colorMap: {[key: string]: string} = {
            TO_BE_CONTACTED: 'var(--status-color-to-be-contacted)',
            CONTACTED: 'var(--status-color-contacted)',
            IN_DISCUSSION: 'var(--status-color-in-discussion)',
            FACTURED: 'var(--status-color-factured)',
            CONFIRMED: 'var(--status-color-confirmed)',
            ABSENT: 'var(--status-color-absent)',
        };
        return colorMap[status] || 'inherit';
    }

    getStatusBackgroundColor(status: string): string
    {
        const bgColorMap: {[key: string]: string} = {
            TO_BE_CONTACTED: 'color-mix(in srgb, var(--status-color-to-be-contacted) 12%, transparent)',
            CONTACTED: 'color-mix(in srgb, var(--status-color-contacted) 12%, transparent)',
            IN_DISCUSSION: 'color-mix(in srgb, var(--status-color-in-discussion) 12%, transparent)',
            FACTURED: 'color-mix(in srgb, var(--status-color-factured) 12%, transparent)',
            CONFIRMED: 'color-mix(in srgb, var(--status-color-confirmed) 12%, transparent)',
            ABSENT: 'color-mix(in srgb, var(--status-color-absent) 12%, transparent)',
        };
        return bgColorMap[status] || 'transparent';
    }

    navigateToEntity()
    {
        const id = this.entityId();
        if (id && this.entityType() === 'PUBLISHER')
        {
            this.router.navigate(['/publishers', id]);
        }
    }
}
