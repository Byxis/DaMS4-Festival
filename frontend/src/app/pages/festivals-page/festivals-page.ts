
import {Component, computed, effect, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFabButton, MatIconButton} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from "@angular/material/icon";
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FestivalList} from "src/app/festivals/festival-list-component/festival-list";
import {FestivalNewFormComponent} from 'src/app/festivals/festival-new-form-component/festival-new-form-component';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';

type SortOption = 'startDate'|'endDate'|'name'|'id';
type SortDirection = 'asc'|'desc';


@Component({
    selector: 'app-festivals-page',
    imports: [
        FestivalList,
        MatIcon,
        MatFabButton,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        FormsModule,
        MatTooltipModule,
        MatIconButton
    ],
    templateUrl: './festivals-page.html',
    styleUrl: './festivals-page.scss'
})
export class FestivalsPage
{
    readonly svc = inject(FestivalService);

    private readonly dialog = inject(MatDialog);

    searchTerm = signal('');
    sortBy = signal<SortOption>('startDate');
    sortDirection = signal<SortDirection>('asc');
    showCurrentOnly = signal(false);

    filteredFestivals = computed(() => {
        let festivals = [...this.svc._festivals()];

        if (this.showCurrentOnly())
        {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            festivals = festivals.filter(f => {
                const start = new Date(f.start_date);
                const end = new Date(f.end_date);
                return start <= today && end >= today;
            });
        }

        const term = this.searchTerm().toLowerCase().trim();
        if (term)
        {
            festivals = festivals.filter(f => f.name.toLowerCase().includes(term));
        }

        const sort = this.sortBy();
        const dir = this.sortDirection();
        const mult = dir === 'asc' ? 1 : -1;

        festivals.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sort)
            {
                case 'startDate':
                    valA = new Date(a.start_date).getTime();
                    valB = new Date(b.start_date).getTime();
                    break;
                case 'endDate':
                    valA = new Date(a.end_date).getTime();
                    valB = new Date(b.end_date).getTime();
                    break;
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'id':
                    valA = a.id ?? 0;
                    valB = b.id ?? 0;
                    break;
            }

            if (valA < valB) return -1 * mult;
            if (valA > valB) return 1 * mult;
            return 0;
        });

        return festivals;
    });

    constructor()
    {
        effect(() => {this.svc.loadFestivalsFromServer()});
    }

    openFormDialog(): void
    {
        const dialogRef = this.dialog.open(FestivalNewFormComponent, {width: '600px', disableClose: false});

        dialogRef.afterClosed().subscribe(result => {
            if (result)
            {
                this.svc.loadFestivalsFromServer();
            }
        });
    }

    toggleSortDirection(): void
    {
        this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    }
}
