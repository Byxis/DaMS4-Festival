import {Component, effect, inject} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";

import {FestivalCard} from '../festival-card-component/festival-card';
import {FestivalService} from '../festival-service/festival-service';

@Component({
    selector: 'app-festival-list',
    imports: [FestivalCard, MatButtonModule],
    templateUrl: './festival-list.html',
    styleUrl: './festival-list.scss'
})
export class FestivalList
{
    constructor()
    {
        effect(() => {this.svc.loadFestivalsFromServer()});
    }
    readonly svc = inject(FestivalService);
}
