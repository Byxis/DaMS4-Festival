import { Component } from '@angular/core';
import { Login } from '@auth/login/login.component';

@Component({
  selector: 'login-page',
  imports: [Login],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPage {}
