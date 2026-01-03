import { Component, inject } from '@angular/core';
import { FestivalList } from "src/app/festivals/festival-list-component/festival-list";
import { MatIcon } from "@angular/material/icon";

import { MatDialog } from '@angular/material/dialog';
import { FestivalService } from 'src/app/festivals/festival-service/festival-service';
import { FestivalNewFormComponent } from 'src/app/festivals/festival-new-form-component/festival-new-form-component';
import { MatButton, MatFabButton } from '@angular/material/button';



@Component({
  selector: 'app-festivals-page',
  imports: [FestivalList, MatIcon, FestivalNewFormComponent, MatFabButton, MatButton],
  templateUrl: './festivals-page.html',
  styleUrl: './festivals-page.scss'
})
export class FestivalsPage {


  readonly svc = inject(FestivalService);

  private readonly dialog = inject(MatDialog);
  //Change the state of showForm to show form
  openFormDialog(): void {
    const dialogRef = this.dialog.open(FestivalNewFormComponent, {
      width: '600px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.svc.loadFestivalsFromServer();
      }
    });
  }
}
