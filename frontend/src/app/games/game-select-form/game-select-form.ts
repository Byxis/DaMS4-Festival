
import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { GameService } from '../game-service/game-service';
@Component({
  selector: 'app-game-select-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatOptionModule,
  ],
  templateUrl: './game-select-form.html',
  styleUrl: './game-select-form.scss'
})
export class GameSelectForm {
  private readonly dialogRef = inject(MatDialogRef<GameSelectForm>);
  private readonly gameService = inject(GameService);
  private readonly data = inject(MAT_DIALOG_DATA);

  readonly availableGames = signal<any[]>([]);
  readonly selectedGames = signal<any[]>([]);

  readonly form = new FormGroup({
    games: new FormControl<number[]>([], Validators.required)
  });

  constructor() {
    effect(() => {
      const publisherId = this.data?.publisherId;
      if (publisherId) {
        this.loadGamesByPublisher(publisherId);
      } 
    });
  }

  private loadGamesByPublisher(publisherId: number) {
    this.gameService.filterByEditorID(publisherId).subscribe({
      next: (games) => {
        const sortedGames = games.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
        this.availableGames.set(sortedGames);
      },
      error: (err) => console.error('Error loading games:', err)
    });
  }

  submit(): void {
    if (this.form.valid) {
      const selectedGameIds = this.form.get('games')?.value ?? [];
      const selectedGames = this.availableGames().filter(g => 
        selectedGameIds.includes(g.id)
      );
      this.dialogRef.close({
        games: selectedGames
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
