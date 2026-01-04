import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PublisherService } from '@publisher/publisher.service';
import { FestivalService } from '@festivals/festival-service/festival-service';
import { Router } from '@angular/router';

@Component({
  selector: 'reservation',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.scss',
})
export class ReservationComponent {
  private readonly publisherService = inject(PublisherService);
  private readonly festivalService = inject(FestivalService);
  private readonly router = inject(Router);

  readonly publisherId = input.required<number>({ alias: 'publisher' });
  readonly festivalId = input.required<number>({ alias: 'festival' });

  readonly publisher = computed(() => {
    const id = this.publisherId();
    return this.publisherService._publishers().find((p) => p.id === id);
  });

  readonly festival = computed(() => {
    const id = this.festivalId();
    return this.festivalService._festivals().find((f) => f.id === id);
  });

  readonly isLoading = computed(() => {
    return this.publisherService.isLoading() || this.festivalService.isLoading();
  });

  readonly isError = computed(() => {
    return this.publisherService.isError() || this.festivalService.isError();
  });

  readonly isExpanded = signal(false);
  readonly selectedStatus = signal<string>('CONFIRMED');

  readonly items = signal([
    { label: 'Contacté ?', checked: false, locked: false },
    { label: 'En discussion ?', checked: false, locked: false },
    { label: 'Facturé ?', checked: false, locked: false },
    { label: 'Payé ?', checked: false, locked: false },
    { label: 'Absent', checked: false, locked: false },
  ]);

  readonly statuses = [
    'TO_BE_CONTACTED',
    'CONTACTED',
    'IN_DISCUSSION',
    'FACTURED',
    'CONFIRMED',
    'ABSENT',
  ];

  readonly currentStatusLabel = computed(() => {
    return this.getStatusLabel(this.selectedStatus());
  });

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
  }

  setStatus(status: string) {
    this.selectedStatus.set(status);
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
