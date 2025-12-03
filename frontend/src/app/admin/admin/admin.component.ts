import { Component, effect, inject, WritableSignal } from '@angular/core';
import { UserDto } from '../../shared/types/user-dto';
import { UserService } from '@users/user.service';
import { UserCard } from '@users/user-card/user-card';
@Component({
  selector: 'admin',
  imports: [UserCard],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly userService = inject(UserService);
  readonly users: WritableSignal<UserDto[]> = this.userService.users;
  // Charge la liste à l’arrivée sur la page
  constructor() {
    effect(() => this.userService.loadAll());
  }
}
