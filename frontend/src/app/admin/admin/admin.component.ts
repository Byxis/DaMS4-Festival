import { Component, effect, inject, WritableSignal } from '@angular/core';
import { UserDto } from '../../shared/types/user-dto';
import { UserService } from '@users/user.service';
import { UserCard } from '@users/user-card/user-card';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialog } from '@admin/create-user-dialog/create-user-dialog.component';
import { AuthService } from '@auth/auth.service';
@Component({
  selector: 'admin',
  imports: [MatCard, MatCardContent, MatIcon, MatChip, MatList, MatDivider],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly userSvc = inject(UserService);
  private readonly dialog = inject(MatDialog);
  readonly users: WritableSignal<UserDto[]> = this.userSvc.users;
  // Charge la liste à l’arrivée sur la page
  constructor() {
    effect(() => this.userSvc.loadAll());
    console.log(this.users()[0]);
  }

  displayedColumns: string[] = ['firstName', 'lastName', 'role', 'email'];

  openCreateDialog(): void {
      const dialogRef = this.dialog.open(CreateUserDialog, {
        data: null,
        width: '600px',
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.user) {
          this.userSvc.createUser(result.user);
        }
      });
    }

  openEditDialog(user: UserDto): void {
    const dialogRef = this.dialog.open(CreateUserDialog, {
        data: user,
        width: '600px',
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (!result?.user?.id) return;
        this.userSvc.editUser(result.user as UserDto);
        
      });
}

}
