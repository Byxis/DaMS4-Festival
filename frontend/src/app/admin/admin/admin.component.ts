import { Component, effect, inject, WritableSignal } from '@angular/core';
import { UserDto } from '../../shared/types/user-dto';
import { UserService } from '@users/user.service';
import { UserCard } from '@users/user-card/user-card';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
@Component({
  selector: 'admin',
  imports: [UserCard, MatCard, MatCardContent, MatIcon, MatChip, MatList, MatDivider],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly userService = inject(UserService);
  readonly users: WritableSignal<UserDto[]> = this.userService.users;
  // Charge la liste à l’arrivée sur la page
  constructor() {
    effect(() => this.userService.loadAll());
    console.log(this.users()[0]);
  }

  displayedColumns: string[] = ['icon', 'firstName', 'lastName', 'role', 'email', 'actions'];

  onAddUser() {
    // open dialog / navigate
  }

  onEditUser(user: any) {
    // open dialog / navigate
}

}
