import {CommonModule} from '@angular/common';
import {Component, effect, inject} from '@angular/core';
import {AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {map, Observable} from 'rxjs';

import {GameService} from '../game-service/game-service';

import {GameType} from './game-type';

@Component({
    selector: 'app-game-form',
    standalone: true,
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
    templateUrl: './game-form.html',
    styleUrl: './game-form.scss',
})
export class GameForm
{
    private gameService = inject(GameService);
    private dialogRef = inject(MatDialogRef<GameForm>);
    data = inject<{game?: any; publisherId: number | null; publisherName: string | null}>(MAT_DIALOG_DATA);

    gameTypes = Object.values(GameType);
    isEditMode = false;

    currentLogoUrl: string|null = null;
    newLogoFile: File|null = null;

    readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern('^[A-Za-z0-9 ]+$'), Validators.minLength(1)],
            asyncValidators: [this.gameNameValidator()]
        }),
        editor: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern('^[A-Za-z0-9 ]+$'), Validators.minLength(1)]
        }),
        type: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        number_minimal_of_player: new FormControl(
            1, {nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(99)]}),
        number_maximal_of_player: new FormControl(
            1, {nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(99)]}),
    });

    constructor()
    {
        effect(() => {
            if (this.data?.game)
            {
                this.isEditMode = true;
                const game = this.data.game;
                this.form.patchValue({
                    name: game.name || '',
                    editor: game.editor_name || this.data.publisherName || '',
                    type: game.type || '',
                    number_minimal_of_player: game.minimum_number_of_player || 1,
                    number_maximal_of_player: game.maximum_number_of_player || 1
                });

                if (game.logo)
                {
                    if (typeof game.logo === 'string' && game.logo.startsWith('http'))
                    {
                        this.currentLogoUrl = game.logo;
                    }
                    else if (game.id)
                    {
                        this.currentLogoUrl = `https://localhost:4000/api/games/${game.id}/logo`;
                    }
                }
            }

            if (this.data?.publisherId && this.data?.publisherName)
            {
                this.form.get('editor')?.setValue(this.data.publisherName);
                this.form.get('editor')?.disable();
            }
            else
            {
                this.form.get('editor')?.enable();
            }
        });
    }

    onLogoSelected(event: Event): void
    {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0])
        {
            this.newLogoFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentLogoUrl = e.target?.result as string;
            };
            reader.readAsDataURL(this.newLogoFile);
        }
    }

    private gameNameValidator(): AsyncValidatorFn
    {
        return (control: AbstractControl): Observable<ValidationErrors|null> => {
            if (!control.value)
            {
                return new Observable(obs => {
                    obs.next(null);
                    obs.complete();
                });
            }

            if (this.data?.game && control.value === this.data.game.name)
            {
                return new Observable(obs => {
                    obs.next(null);
                    obs.complete();
                });
            }

            const publisherId = this.data?.publisherId;

            if (!publisherId)
            {
                return new Observable(obs => {
                    obs.next(null);
                    obs.complete();
                });
            }

            return this.gameService.checkGameNameExists(control.value, publisherId)
                .pipe(map(exists => exists ? {gameNameExists: true} : null));
        };
    }

    removeLogo(): void
    {
        this.newLogoFile = null;
        this.currentLogoUrl = null;
    }

    submit(): void
    {
        if (this.form.valid)
        {
            const data = this.form.getRawValue();

            const gameData = {...data, logoFile: this.newLogoFile};

            this.dialogRef.close(gameData);
        }
    }

    cancel(): void
    {
        this.dialogRef.close(null);
    }

    getErrorMessage(control: any): string|null
    {
        if (control)
        {
            if (control.errors)
            {
                if (control.errors['required']) return 'Entrer une valeur';
                if (control.errors['minlength']) return 'La valeur entrée est trop courte';
                if (control.errors['pattern']) return 'Format invalide';
                if (control.errors['gameNameExists']) return 'Ce jeu existe déjà';
                if (control.errors['min']) return 'La valeur doit être au minimum 1';
                if (control.errors['max']) return 'La valeur doit être au maximum 99';
            }
        }
        return null;
    }
}