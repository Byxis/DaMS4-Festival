import { DatePipe } from '@angular/common';
import { Component, input, Output, EventEmitter, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Festival } from '../festival';
import { FestivalDto } from '../festival-dto';

@Component({
  selector: 'app-festival-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.scss'
})
export class FestivalCard {
  festival = input.required<FestivalDto>();
  remove = output<number>();
  isHovered = false;
  }