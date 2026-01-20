import {HttpClient} from '@angular/common/http';
import {Component, effect, inject, input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardTitle} from '@angular/material/card';
import {MatOptionModule} from '@angular/material/core';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ActivatedRoute} from '@angular/router';

import {GameForm} from '../game-form/game-form';
import {GameSelectForm} from '../game-select-form/game-select-form';
import {GameService} from '../game-service/game-service';
import {GameDto} from '../game/game-dto';



@Component({
    selector: 'app-game-list',
    imports: [
        MatFormFieldModule,
        MatIconModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatCardTitle,
        MatTooltipModule
    ],
    templateUrl: './game-list.html',
    styleUrl: './game-list.scss'
})
export class GameList
{
    private dialog = inject(MatDialog);
    readonly http = inject(HttpClient)
    readonly gameService = inject(GameService)
    readonly route = inject(ActivatedRoute);

    showForm = false;
    showCreateForm = false;

    searchTerm = signal('');
    hasGames = false;

    private allGames: GameDto[] = [];

    isGameListForPublisher = input<boolean>(false);
    listOfGameFromPublisher = input<GameDto[]>([]);
    publisherId = input<number>();
    publisherName = input<string|undefined>(undefined);

    // initial sort
    orderSelection = 'name_game_asc';



    logoErrors = new Set<number>();

    onLogoError(gameId: number, event: any): void
    {
        this.logoErrors.add(gameId);
        event.target.style.display = 'none';
    }
    // show the newGame form
    setShowFormTrue()
    {
        this.showForm = true;
    }

    // hide the createNewGame form
    setShowFormFalse()
    {
        this.showForm = false;
    }

    // show the filter form
    setFilterFormTrue()
    {
        this.showForm = false;
    }

    onFormClose(closeRequested: boolean): void
    {
        if (closeRequested)
        {
            this.showCreateForm = false;
            console.log('Form requested close');
        }
    }

    searchGameByPublisherID(publisherId: number): void
    {
        this.gameService.searchGameByPublisherIDInDBObservable(publisherId).subscribe({
            next: (games) => {
                this.allGames = games;  // Store all games for local filtering
                this.gameService.setGames(games);
                this.gameService.sortGames(this.orderSelection);
            },
            error: (err) => {
                console.error('Erreur lors de la recherche', err);
            }
        });
    }

    searchGameByName(gameName: string): void
    {
        if (!gameName || gameName.trim() === '')
        {
            this.gameService.setGames(this.allGames);
            this.gameService.sortGames(this.orderSelection);
            return;
        }

        const searchLower = gameName.toLowerCase();
        const filteredGames = this.allGames.filter(game => game.name?.toLowerCase().includes(searchLower));

        this.gameService.setGames(filteredGames);
        this.gameService.sortGames(this.orderSelection);
    }

    checkIfPublisherHasGames()
    {
        const publisherId = this.publisherId();
        if (!publisherId) return;

        this.gameService.checkPublisherGames(publisherId).subscribe({
            next: (data) => {
                this.hasGames = data.hasGames;
            },
            error: (err) => console.error(err)
        });
    }

    changeOrder(order: string): void
    {
        this.orderSelection = order;

        this.gameService.sortGames(order);
    }

    constructor()
    {
        effect(() => {
            if (this.isGameListForPublisher() && this.publisherId())
            {
                this.searchGameByPublisherID(this.publisherId()!);
                this.checkIfPublisherHasGames();
            }
        });
    }

    openGameFormDialog(): void
    {
        this.dialog
            .open(GameForm, {
                width: '600px',
                data: {game: null, publisherId: this.publisherId(), publisherName: this.publisherName()}
            })
            .afterClosed()
            .subscribe(result => {
                if (result)
                {
                    this.createGameFromForm(result);
                }
            });
    }

    openGameSelectDialog(): void
    {
        this.dialog.open(GameSelectForm, {width: '500px', data: {publisherId: this.publisherId()}})
            .afterClosed()
            .subscribe(result => {
                this.addExistingGamesToPublisher(result.games);
            });
    }

    private reloadGames(): void
    {
        if (this.isGameListForPublisher() && this.publisherId())
        {
            this.searchGameByPublisherID(this.publisherId()!);
        }
    }

    addExistingGamesToPublisher(games: any[]): void
    {
        if (!games || games.length === 0) return;

        games.forEach(game => {
            const gameData = {
                name: game.name,
                publisher_id: this.publisherId(),
                type: game.type,
                minimum_number_of_player: game.minimum_number_of_player,
                maximum_number_of_player: game.maximum_number_of_player,
                logo: game.logo || null
            };

            console.log('Game data to add:', gameData);
            this.gameService.add(gameData);
        });
        setTimeout(() => {
            this.reloadGames();
            this.gameService.sortGames(this.orderSelection);
        }, 1500);
    }

    createGameFromForm(form: {
        name: string,
        editor: string,
        type: string,
        number_minimal_of_player: number,
        number_maximal_of_player: number,
        logoFile?: File
    })
    {
        const gameData: Partial<GameDto>&{logoFile?: File} = {
            name: form.name,
            publisher_id: this.publisherId(),
            editor_name: form.editor,
            type: form.type,
            minimum_number_of_player: form.number_minimal_of_player,
            maximum_number_of_player: form.number_maximal_of_player,
            logoFile: form.logoFile
        };

        this.gameService.add(gameData);
        this.setShowFormFalse();
        setTimeout(() => {
            this.reloadGames();
            this.gameService.sortGames(this.orderSelection);
        }, 1000);
    }

    openEditGameDialog(game: GameDto): void
    {
        this.dialog
            .open(GameForm, {
                width: '600px',
                data: {game: game, publisherId: this.publisherId(), publisherName: this.publisherName()}
            })
            .afterClosed()
            .subscribe(result => {
                if (result)
                {
                    this.updateGameFromForm(game.id!, result);
                }
            });
    }

    confirmDeleteGame(game: GameDto): void
    {
        const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le jeu "${game.name}" ?`);
        if (confirmed)
        {
            this.deleteGame(game.id!);
        }
    }

    private deleteGame(gameId: number): void
    {
        this.gameService.delete(gameId).subscribe({
            next: () => {
                this.reloadGames();
            },
            error: (err) => {
                console.error('Erreur lors de la suppression', err);
            }
        });
    }

    private updateGameFromForm(gameId: number, form: {
        name: string,
        editor: string,
        type: string,
        number_minimal_of_player: number,
        number_maximal_of_player: number,
        logoFile?: File
    }): void
    {
        const gameData: Partial<GameDto>&
        {
            id: number;
            logoFile?: File
        }
        = {
            id: gameId,
            name: form.name,
            publisher_id: this.publisherId(),
            editor_name: form.editor,
            type: form.type,
            minimum_number_of_player: form.number_minimal_of_player,
            maximum_number_of_player: form.number_maximal_of_player,
            logoFile: form.logoFile
        };

        this.gameService.update(gameData).subscribe({
            next: () => {
                this.reloadGames();
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour', err);
            }
        });
    }
}
