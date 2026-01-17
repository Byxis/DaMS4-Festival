import { Component, inject, WritableSignal } from '@angular/core';
import { UserDto } from '../../shared/types/user-dto';
import { UserService } from '@users/user.service';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialog } from '@admin/create-user-dialog/create-user-dialog.component';
import { UsersListComponent } from "@admin/users-list/users-list.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'admin',
  imports: [MatIcon, UsersListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly userSvc = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly users: WritableSignal<UserDto[]> = this.userSvc.users;

  displayedColumns: string[] = ['firstName', 'lastName', 'role', 'email'];

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialog, {
      data: null,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.user) {
        this.userSvc.createUser(result.user).subscribe({
          next: (res) => {
            this.userSvc.users.set([...this.userSvc.users(), res.user]);

            this.snack.open(res.message, "OK", { duration: 2500 });
          },
          error: (err) => {
            this.snack.open(err?.error?.error ?? "Erreur serveur", "OK", {
              duration: 3500,
            });
          },
        });
      }
    });
  }


}
