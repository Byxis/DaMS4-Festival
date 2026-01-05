import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../reservation.service';
import type { Reservation } from '../reservation.type';

@Component({
  selector: 'note',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note.html',
  styleUrl: './note.scss',
})
export class NoteComponent {
  private readonly reservationService = inject(ReservationService);

  readonly note = input.required<string | null>();
  readonly reservation = input.required<Reservation | undefined>();
  readonly festivalId = input.required<number>();

  private previousNote = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.previousNote.set(this.note());
    });
  }

  updateNote(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    this.updateNoteInDatabase(value);
  }

  onNoteBlur() {
    const currentNote = this.note();
    const previousNote = this.previousNote();

    if (currentNote !== previousNote) {
      this.updateNoteInDatabase(currentNote ?? '');
    }
  }

  private updateNoteInDatabase(value: string) {
    const festivalId = this.festivalId();
    const reservation = this.reservation();
    const previousNote = this.previousNote();

    if (!reservation?.id || !festivalId || value === previousNote) {
      return;
    }

    this.reservationService.update(festivalId, reservation.id, { note: value }).subscribe({
      next: () => {
        this.previousNote.set(value);
      },
      error: () => {
        console.error('Error updating note');
      },
    });
  }
}
