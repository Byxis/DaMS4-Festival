import {Component, inject} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from "@angular/material/icon";
import {FestivalList} from "src/app/festivals/festival-list-component/festival-list";
import {FestivalNewFormComponent} from 'src/app/festivals/festival-new-form-component/festival-new-form-component';
import {FestivalService} from 'src/app/festivals/festival-service/festival-service';



@Component({
    selector: 'app-festivals-page',
    imports: [FestivalList, MatIcon, MatFabButton],
    templateUrl: './festivals-page.html',
    styleUrl: './festivals-page.scss'
})
export class FestivalsPage
{
    readonly svc = inject(FestivalService);

    private readonly dialog = inject(MatDialog);
    // Change the state of showForm to show form
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
}
