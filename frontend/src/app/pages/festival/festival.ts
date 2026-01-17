import { Component, inject, input, effect } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TarifZonesList } from 'src/app/festivals/tarif-zones-list/tarif-zones-list';
import { FestivalService } from 'src/app/festivals/festival-service/festival-service';
import { FestivalDto } from 'src/app/festivals/dtos/festival-dto';

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
export class Festival {
  private readonly router = inject(Router);
  private readonly svc = inject(FestivalService);

  id = input.required<number>();
  festival = this.svc._currentFestival;

  constructor() {
    effect(() => {
      const festivalId = this.id();
      if (festivalId) {
        this.svc.loadFestivalById(festivalId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/festivals']);
  }

  editFestival(): void {
    // Votre code d'édition
  }

  getDateRange(festival: FestivalDto): string {
    const start = new Date(festival.start_date);
    const end = new Date(festival.end_date);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}