
import {CommonModule} from '@angular/common';
import {Component, effect, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {EntityDTO} from '@publisher/entityDto';

import {OtherService} from '../other.service';

@Component({
    selector: 'other-import-dialog',
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
    templateUrl: './other-import-dialog.html',
    styleUrl: './other-import-dialog.scss'
})
export class OtherImportDialog implements OnInit
{
    private dialogRef = inject(MatDialogRef<OtherImportDialog>);
    private otherService = inject(OtherService);

    private data = inject<{excludedIds: number[]}>(MAT_DIALOG_DATA);

    others: EntityDTO[] = [];
    filteredOthers: EntityDTO[] = [];
    searchTerm = '';
    isLoading = true;

    constructor()
    {
        effect(() => {
            const allOthers = this.otherService._others();
            const excluded = new Set(this.data?.excludedIds || []);
            this.others = allOthers.filter(o => o.id !== undefined && !excluded.has(o.id));

            this.isLoading = this.otherService.isLoading();
            this.filter();
        });
    }

    ngOnInit()
    {
        this.otherService.loadAll();
    }

    filter()
    {
        const term = this.searchTerm.toLowerCase();
        this.filteredOthers = this.others.filter(o => o.name.toLowerCase().includes(term));
    }

    import(other: EntityDTO)
    {
        this.dialogRef.close(other);
    }

    cancel()
    {
        this.dialogRef.close();
    }
}
