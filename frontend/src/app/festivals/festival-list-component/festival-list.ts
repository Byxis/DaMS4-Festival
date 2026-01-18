import {Component, computed, effect, inject, WritableSignal} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatIcon} from '@angular/material/icon';

import {FestivalCard} from '../festival-card-component/festival-card';
import {FestivalNewFormComponent} from "../festival-new-form-component/festival-new-form-component";
import {FestivalService} from '../festival-service/festival-service';

@Component({
    selector: 'app-festival-list',
    imports: [FestivalCard, FestivalNewFormComponent, MatButtonModule, MatIcon],
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
