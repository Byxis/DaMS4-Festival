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
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

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

  openUserProfileDialog(user: UserDto) {
    if (!user) return;

    this.dialog.open(UserProfileDialogComponent, {
      width: '360px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: false,
      data: user,
    });
  }


}
