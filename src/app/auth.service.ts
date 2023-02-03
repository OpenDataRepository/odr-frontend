import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userEmitter = new BehaviorSubject<User|null>(null);
  private activeLogoutTimer: any;

  constructor(private http: HttpClient) { }

  signUp(email: string, password: string) {
    return this.http
    .post(
      environment.backend_url +  '/account/register',
      { email: email, password: password }
    )
    .pipe(
      switchMap((result: any) => this.confirmEmail(result.token)),
      switchMap(() => this.login(email, password))
    );
  }

  // During development, just confirm the email automatically when the user signs up
  private confirmEmail(email_token: string) {
    return this.http.get(environment.backend_url +  '/account/confirm_email/' + email_token);
  }

  login(email: string, password: string) {
    console.log('login called');
    return this.http
      .post(
        environment.backend_url +  '/account/login',
        { email, password }
      )
      .pipe(tap((result: any) => this.setUserData(email, result.token, result.expirationTime)));
  }

  autoLogin() {
    return from(Preferences.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this.userEmitter.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  private setUserData(email: string, token: string, expirationTime: string) {
    console.log(`setUserData called. email: ${email}, token: ${token}, expirationDate: ${expirationTime}`);
    const user = new User(
      email,
      token,
      new Date(expirationTime)
    );
    this.userEmitter.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      token,
      expirationTime,
      email
    );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.userEmitter.next(null);
    Preferences.remove({ key: 'authData' });
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private storeAuthData(token: string, tokenExpirationDate: string, email: string) {
    const data = JSON.stringify({
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    console.log('storing auth data: '); console.log(data);
    Preferences.set({ key: 'authData', value: data });
  }

  get userIsAuthenticated() {
    console.log('userIsAuthenticated called');
    return this.userEmitter.asObservable().pipe(
      map(user => {
        console.log(user);
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get email() {
    return this.userEmitter.asObservable().pipe(
      map(user => {
        if (user) {
          return user.email;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this.userEmitter.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }
}
