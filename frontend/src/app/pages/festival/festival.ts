import { DatePipe } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FestivalService } from 'src/app/festivals/festival-service/festival-service';
import { CommonModule } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { ZoneTarifFormComponent } from 'src/app/festivals/zone-tarif-form-component/zone-tarif-form-component';


@Component({
  selector: 'app-festival',
  imports: [DatePipe,
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
            MatInputModule
          ],
  templateUrl: './festival.html',
  styleUrl: './festival.scss'
})
export class Festival {

  id = input.required<number>();

  private readonly svc = inject(FestivalService);
  private readonly router = inject(Router)
  private readonly dialog = inject(MatDialog)

  festival = this.svc._currentFestival;


  constructor() {
    effect(() => {
      this.svc.loadFestivalById(this.id());
    });
  }

  goBack(): void {
    this.router.navigate(['/festivals']);
  }

    // Open dialog to add new tariff zone
  openAddZoneDialog(): void {
    const dialogRef = this.dialog.open(ZoneTarifFormComponent,{
      width: '500px',
      disableClose: false,
      data: { festivalId: this.id() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload festival to show new zone
        this.svc.loadFestivalById(this.id());
      }
    });
  }




  // Helper: Format date range
  getDateRange(festival: any): string {
    if (!festival.start_date || !festival.end_date) return 'N/A';
    const start = new Date(festival.start_date).toLocaleDateString('fr-FR');
    const end = new Date(festival.end_date).toLocaleDateString('fr-FR');
    return `${start} au ${end}`;
  }

  // Helper: Get table type display name
  getTableTypeName(type: string): string {
    const names: Record<string, string> = {
      'table_count': 'Tables',
      'big_table_count': 'Grandes Tables',
      'town_table_count': 'Tables Municipales'
    };
    return names[type] || type;
  }


}
