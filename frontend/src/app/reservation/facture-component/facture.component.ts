import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { ReservationGame } from '../reservation.type';

@Component({
  selector: 'facture',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './facture.html',
  styleUrl: './facture.scss',
})
export class FactureComponent {
  readonly games = input.required<ReservationGame[] | undefined>();

  readonly zoneSummary = computed(() => {
    const gameList = this.games() ?? [];

    const zones = [
      { key: 'standard', label: 'Tables standards', price: 0 },
      { key: 'large', label: 'Tables grandes', price: 0 },
      { key: 'small', label: 'Tables mairies', price: 0 },
      { key: 'electrical', label: 'Prises électriques', price: 0 },
    ];

    const summary = zones.map((zone) => {
      let count = 0;

      gameList.forEach((game) => {
        if (zone.key === 'standard') count += game.table_count ?? 0;
        if (zone.key === 'large') count += game.big_table_count ?? 0;
        if (zone.key === 'small') count += game.town_table_count ?? 0;
        if (zone.key === 'electrical') count += game.electrical_outlets ?? 0;
      });

      return {
        ...zone,
        count,
        total: count * zone.price,
      };
    });

    const grandTotal = summary.reduce((sum, zone) => sum + zone.total, 0);
    return { zones: summary, grandTotal };
  });

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
