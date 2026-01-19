import { Component, inject } from "@angular/core";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "@auth/auth.service";
import { roleEnToFr } from 'src/app/shared/utils/roles';


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
  router = inject(Router);
  roleEnToFr = roleEnToFr;

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/']);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

}
