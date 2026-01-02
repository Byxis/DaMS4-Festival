import { Component, signal, WritableSignal, effect, computed, inject } from '@angular/core';
import { FestivalCard } from '../festival-card-component/festival-card';
import { FestivalService } from '../festival-service/festival-service';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FestivalNewFormComponent } from "../festival-new-form-component/festival-new-form-component";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-festival-list',
  imports: [FestivalCard, FestivalNewFormComponent, MatButtonModule, MatIcon],
  templateUrl: './festival-list.html',
  styleUrl: './festival-list.scss'
})
  export class FestivalList {
    private readonly dialog = inject(MatDialog);

    constructor() {
      effect(() => { this.svc.loadFestivalsFromServer() });
    }

    readonly svc = inject(FestivalService);


    //Change the state of showForm to show form
    openFormDialog(): void {
      const dialogRef = this.dialog.open(FestivalNewFormComponent, {
        width: '600px',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onFestivalCreated();
        }
      });
    }

    onFestivalCreated() {
      this.svc.loadFestivalsFromServer(); // Actualise la liste
    }


    removeFestival(id: number): void { this.svc.removeFestival(id) }

  }
