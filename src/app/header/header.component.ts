import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit{

  isLoggedIn = false;
  email: string|null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.reloadAuthorized();
  }

  reloadAuthorized() {
    console.log('header componenet ionViewWillEnter called');
    this.auth.userIsAuthenticated.subscribe(result => this.isLoggedIn = result);
    if(this.isLoggedIn) {
      this.auth.email.subscribe(result => this.email = result);
    }
  }

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

}
