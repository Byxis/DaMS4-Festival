import {Component, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

import {FestivalDto} from '../dtos/festival-dto';
import {FestivalCard} from '../festival-card-component/festival-card';

@Component({
    selector: 'app-festival-list',
    imports: [FestivalCard, MatIconModule],
    templateUrl: './festival-list.html',
    styleUrl: './festival-list.scss'
})
export class FestivalList
{
    festivals = input.required<FestivalDto[]>();
}
