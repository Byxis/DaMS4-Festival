import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { ReservationInteraction } from '../reservation.type';

@Component({
  selector: 'updates',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './updates.html',
  styleUrl: './updates.scss',
})
export class UpdatesComponent {
  readonly interactions = input.required<ReservationInteraction[] | undefined>();

  readonly sortedInteractions = computed(() => {
    const items = this.interactions() ?? [];
    return [...items].sort(
      (a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
    );
  });

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
