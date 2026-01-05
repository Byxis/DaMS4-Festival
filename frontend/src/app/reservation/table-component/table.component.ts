import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReservationService } from '../reservation.service';
import type { Reservation } from '../reservation.type';

interface TableConfig {
  key: 'tables_standard' | 'tables_large' | 'tables_small';
  label: string;
  icon: string;
}

@Component({
  selector: 'table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class TableComponent {
  private readonly reservationService = inject(ReservationService);

  readonly tableConfig = input.required<TableConfig>();
  readonly count = input.required<number>();
  readonly reservation = input.required<Reservation | undefined>();
  readonly festivalId = input.required<number>();

  private previousValue = signal<number>(0);

  constructor() {
    effect(() => {
      this.previousValue.set(this.count());
    });
  }

  updateValue(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = +target.value;
    this.updateTableInput(value);
  }

  onInputBlur() {
    const currentValue = this.count();
    const previousValue = this.previousValue();

    if (currentValue !== previousValue) {
      this.updateTableInput(currentValue);
    }
  }

  private updateTableInput(value: number) {
    const festivalId = this.festivalId();
    const reservation = this.reservation();
    const key = this.tableConfig().key;
    const previousValue = this.previousValue();

    if (!reservation?.id || !festivalId || value === previousValue) {
      return;
    }

    const updateData: Partial<Reservation> = {};
    if (key === 'tables_standard') updateData.table_count = value;
    if (key === 'tables_large') updateData.big_table_count = value;
    if (key === 'tables_small') updateData.town_table_count = value;

    this.reservationService.update(festivalId, reservation.id, updateData).subscribe({
      next: () => {
        this.previousValue.set(value);
      },
      error: () => {
        console.error('Error updating table input');
      },
    });
  }
}
