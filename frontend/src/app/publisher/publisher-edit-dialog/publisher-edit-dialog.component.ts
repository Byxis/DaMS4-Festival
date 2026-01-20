import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map, Observable, of} from 'rxjs';

import {EntityDTO} from '../entityDto';
import {PublisherService} from '../publisher.service';

@Component({
    selector: 'publisher-edit-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './publisher-edit-dialog.html',
    styleUrl: './publisher-edit-dialog.scss',
})
export class PublisherEditDialog
{
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<PublisherEditDialog>);
    public publisherService = inject(PublisherService);
    data = inject<EntityDTO|null>(MAT_DIALOG_DATA);
    private snackBar = inject(MatSnackBar);

    form = this.fb.group({
        name: [this.data?.name ?? '', Validators.required, this.publisherNameValidator()],
    });

    currentLogoUrl: string|null = this.data?.logoUrl ?? null;
    newLogoFile: File|null = null;
    newLogoPreview: string|null = null;
    logoToDelete: boolean = false;



    private publisherNameValidator()
    {
        return (control: AbstractControl): Observable<ValidationErrors|null> => {
            if (!control.value)
            {
                return of(null);
            }

            if (this.data && control.value === this.data.name)
            {
                return of(null);
            }

            return this.publisherService.checkPublisherExists(control.value).pipe(map((response: any) => {
                if (response.existsInPublisher)
                {
                    return {'publisherExists': true};
                }
                if (response.existsInEditors)
                {
                    return {'canImport': response.editor};
                }
                return null;
            }));
        };
    }

    onFileSelected(event: Event): void
    {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0)
        {
            this.newLogoFile = input.files[0];
            this.logoToDelete = false;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.newLogoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(this.newLogoFile);
        }
    }

    importExistingEditor(editorName: string|null|undefined): void
    {
        if (!editorName || editorName.trim() === "")
        {
            console.error('❌ Nom d\'éditeur vide');
            return;
        }

        this.publisherService.importEditorByName(editorName).subscribe({
            next: (result: any) => {
                console.log(' Publisher importé:', result);

                this.publisherService.addPublisherToList(
                    {...result.publisher, numberOfGames: result.gamesCount, contacts: [], logoUrl: undefined});

                this.dialogRef.close(true);
            },
            error: (err: any) => {
                console.error(' Erreur import:', err);
                alert('Erreur : ' + (err.error?.error || 'Import échoué'));
            }
        });
    }


    deleteLogo(): void
    {
        this.logoToDelete = true;
        this.newLogoFile = null;
        this.newLogoPreview = null;
    }

    deleteNewLogo(): void
    {
        this.newLogoFile = null;
        this.newLogoPreview = null;
    }

    save(): void
    {
        if (this.form.valid)
        {
            this.dialogRef.close({
                publisher: {...this.data, name: this.form.value.name || ''} as EntityDTO,
                newLogo: this.newLogoFile,
                deleteLogo: this.logoToDelete,
            });
        }
    }
}
