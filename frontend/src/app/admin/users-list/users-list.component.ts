import { CreateUserDialog } from '@admin/create-user-dialog/create-user-dialog.component';
import { Component, effect, inject, WritableSignal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatList } from '@angular/material/list';
import { UserService } from '@users/user.service';
import { UserDto } from '../../shared/types/user-dto';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-users-list',
  imports: [MatChip, MatList, MatDivider, MatIcon, MatCard, MatCardContent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  private readonly userSvc = inject(UserService);
  readonly users: WritableSignal<UserDto[]> = this.userSvc.users;
  readonly dialog = inject(MatDialog);
  readonly snack = inject(MatSnackBar);
  // Charge la liste à l’arrivée sur la page
  constructor() {
    effect(() => this.userSvc.loadAll());
    console.log(this.users()[0]);
  }
  displayedColumns: string[] = ['firstName', 'lastName', 'role', 'email'];

  openEditDialog(user: UserDto): void {
    const dialogRef = this.dialog.open(CreateUserDialog, {
      data: user,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.user?.id) return;

      this.userSvc.editUser(result.user as UserDto).subscribe({
        next: (res) => {
          const current = this.users();
          const idx = current.findIndex(u => u.id === res.user.id);
          if (idx !== -1) {
            current[idx] = res.user;
            this.users.set([...current]);
          }

          // show server message
          this.snack.open(res.message, "OK", { duration: 2500 });
        },
        error: (err) => {
          this.snack.open(err?.error?.error ?? "Erreur serveur", "OK", {
            duration: 3500,
          });
        }
      });
    });
  }

  deleteUser(user: UserDto): void {
    if (
      confirm(
        `Êtes-vous sûr de supprimer le utilisateur ${user.firstName} ${user.lastName} ? Cette action est irréversible.`
      )
    ) {
      const index = this.users().findIndex((c) => c.id === user.id);
      if (index !== -1) {
        this.userSvc.deleteUser(user).subscribe({
          next: (res) => {
            this.userSvc.users.set(this.userSvc.users().filter(u => u.id !== user.id));

            // show server message
            this.snack.open(res.message, "OK", { duration: 2500 });
          },
          error: (err) => {
            this.snack.open(err?.error?.error ?? "Erreur serveur", "OK", {
              duration: 3500,
            });
          }
        });
      }
    }
  }

}

