import {DatePipe} from '@angular/common';
import {Component, inject, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';

import {FestivalDto} from '../dtos/festival-dto';

@Component({
    selector: 'app-festival-card',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, DatePipe, MatIconModule],
    templateUrl: './festival-card.html',
    styleUrl: './festival-card.scss'
})
export class FestivalCard
{
    festival = input.required<FestivalDto>();
    isHovered = false;

    private readonly router = inject(Router)


    navigateToFestivalPage(): void
    {
        if (this.festival().id)
        {
            this.router.navigate(["/festivals", this.festival().id]);
        }
    }


    getInitials(): string
    {
        const name = this.festival().name;
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
}