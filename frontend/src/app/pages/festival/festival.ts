import {CommonModule, DatePipe} from '@angular/common';
import {Component, effect, inject, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Router} from '@angular/router';
import {FestivalDto} from 'src/app/festivals/dtos/festival-dto';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';
import {TarifZonesList} from 'src/app/festivals/tarif-zones-list/tarif-zones-list';

@Component({
    selector: 'app-festival',
    imports: [
        DatePipe,
        CommonModule,
        MatCardModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        TarifZonesList  // Ajout du composant
    ],
    templateUrl: './festival.html',
    styleUrl: './festival.scss'
})
export class Festival
{
    private readonly router = inject(Router);
    private readonly svc = inject(FestivalService);

    id = input.required<number>();
    festival = this.svc._currentFestival;

    constructor()
    {
        effect(() => {
            const festivalId = this.id();
            if (festivalId)
            {
                this.svc.loadFestivalById(festivalId);
            }
        });
    }

    goBack(): void
    {
        this.router.navigate(['/festivals']);
    }

    editFestival(): void
    {
        // Votre code d'édition
    }

    getDateRange(festival: FestivalDto): string
    {
        const start = new Date(festival.start_date);
        const end = new Date(festival.end_date);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
}