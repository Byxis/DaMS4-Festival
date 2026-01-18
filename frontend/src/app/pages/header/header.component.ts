import { Component, inject } from "@angular/core";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "@auth/auth.service";
import { UserProfileDialogComponent } from "../user-profile-dialog/user-profile-dialog.component";
import { UserDto } from "../../shared/types/user-dto";
import { roleEnToFr } from 'src/app/shared/utils/roles';
import { UserService } from "@users/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatMenuModule,
    MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authSvc = inject(AuthService);
  userSvc = inject(UserService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  roleEnToFr = roleEnToFr;

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/']);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  async copyName(user: UserDto): Promise<void> {
    const name = `${user?.firstName} ${user?.lastName}`.trim();
    await navigator.clipboard.writeText(name);
  }

  async copyEmail(user: UserDto): Promise<void> {
    const email = user?.email;
    if (!email) return;
    await navigator.clipboard.writeText(email);
  }

  openUserProfileDialog(user: UserDto): void {
    if (!user) return;

    const ref = this.dialog.open(UserProfileDialogComponent, {
      data: user,
    });

    ref.afterClosed().subscribe((result) => {
      this.userSvc.updateUser(result.user as UserDto).subscribe({
        next: (res) => {
          const current = [...this.userSvc.users()];
          const idx = current.findIndex(u => u.id === res.user.id);

          if (idx !== -1) {
            current[idx] = res.user;
            this.userSvc.users.set(current);
          }

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
}