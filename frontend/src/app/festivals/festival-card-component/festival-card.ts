import { DatePipe } from '@angular/common';
import { Component, input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FestivalDto } from '../dtos/festival-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-festival-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.scss'
})
export class FestivalCard {
  festival = input.required<FestivalDto>();
  isHovered = false;

  private readonly router = inject(Router)


  navigateToFestivalPage(): void {
    console.log("You clicked on ", this.festival().id)
    if (this.festival().id) {
      this.router.navigate(["/festivals", this.festival().id]);
    }
  }


    getInitials(): string {
    const name = this.festival().name;
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}