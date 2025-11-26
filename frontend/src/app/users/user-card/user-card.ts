import { Component, input } from '@angular/core';
import { MatCard, MatCardFooter, MatCardTitle } from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { UserDto } from '../../shared/types/user-dto';

@Component({
  selector: 'user-card',
  imports: [MatCard, MatCardFooter, MatChipSet, MatCardFooter, MatCardTitle, MatChip],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  user = input.required<UserDto>();
}
