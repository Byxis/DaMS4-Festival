
import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {GameForm} from '../game-form/game-form';
import {GameService} from '../game-service/game-service';
import {GameDto} from '../game/game-dto';

@Component({
    selector: 'game-manager-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './game-manager-dialog.html',
    styleUrl: './game-manager-dialog.scss'
})
export class GameManagerDialog implements OnInit
{
    private dialogRef = inject(MatDialogRef<GameManagerDialog>);
    private gameService = inject(GameService);
    private dialog = inject(MatDialog);
    private data = inject<{publisherId: number, entityName?: string}>(MAT_DIALOG_DATA);

    games: GameDto[] = [];
    filteredGames: GameDto[] = [];
    searchTerm = signal('');
    isLoading = true;

    ngOnInit()
    {
        this.loadGames();
    }

    loadGames()
    {
        this.isLoading = true;
        this.gameService.searchGameByPublisherIDInDBObservable(this.data.publisherId).subscribe({
            next: (games) => {
                this.games = games;
                this.filter();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching games', err);
                this.isLoading = false;
            }
        });
    }

    filter()
    {
        const term = this.searchTerm().toLowerCase();
        this.filteredGames = this.games.filter(g => g.name.toLowerCase().includes(term));
    }

    editGame(game: GameDto)
    {
        const dialogRef = this.dialog.open(
            GameForm, {data: {game: game, publisherId: this.data.publisherId, publisherName: this.data.entityName}});

        dialogRef.afterClosed().subscribe(result => {
            if (result)
            {
                this.gameService.update({id: game.id!, ...result}).subscribe({
                    next: () => this.loadGames(),
                    error: (err) => console.error('Error updating game', err)
                });
            }
        });
    }

    deleteGame(game: GameDto)
    {
        if (confirm(`Voulez-vous vraiment supprimer ${game.name} ?`))
        {
            this.gameService.delete(game.id!).subscribe(
                {next: () => this.loadGames(), error: (err) => console.error('Error deleting game', err)});
        }
    }

    close()
    {
        this.dialogRef.close();
    }
}
