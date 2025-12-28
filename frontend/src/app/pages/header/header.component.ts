import { Component, inject } from "@angular/core";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "@auth/auth.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatDivider],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authSvc = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

}
