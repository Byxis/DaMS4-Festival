import { DatePipe } from '@angular/common';
import { Component, input, Output, EventEmitter, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Festival } from '../festival';
import { FestivalDto } from '../festival-dto';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-festival-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe, MatIcon],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.scss'
})
export class FestivalCard {
  festival = input.required<FestivalDto>();
  isHovered = false;

  getCardStyle() {
    if (this.festival().logoUrl) {
      return {
        '--card-bg-image': `url(${this.festival().logoUrl})`
      };
    }
    return {};
  }

  getCardClass() {
    return this.festival().logoUrl ? 'has-logo' : '';
  }
  }