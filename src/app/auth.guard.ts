import { Injectable } from '@angular/core';
import { Route, UrlSegment, Router, CanMatch } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log('auth guard triggered');
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        console.log('in authguard: isAuthenticated = ' + isAuthenticated);
        if (!isAuthenticated) {
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      tap(isAuthenticated => {
        console.log('after autologin: isAuthenticated = ' + isAuthenticated);
        if (!isAuthenticated) {
          this.router.navigateByUrl('/log-in');
        }
      })
    );
  }
}
