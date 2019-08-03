import {Injectable, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { environment } from '../environments/environment';
import {delay, mergeMap} from 'rxjs/operators';
import {Observable, of, timer} from 'rxjs';

@Injectable()
export class AuthService {

  private _idToken: string;
  private _accessToken: string;
  private _expiresAt: number;

  public userProfile;

  lastErrorMessage = 'Unknown Error';

  refreshSubscription: any;

  auth0 = new auth0.WebAuth({
    clientID: environment.AUTH0_CLIENT_ID,
    audience: environment.AUTH0_AUDIENCE,
    domain: 'login.connectourkids.org',
    responseType: 'token id_token',
    redirectUri: environment.APP_URL + '/callback',
    scope: 'openid profile email'
  });



  constructor(public router: Router, private _ngZone: NgZone) {
    this._idToken = '';
    this._accessToken = '';
    this._expiresAt = 0;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get idToken(): string {
    return this._idToken;
  }

  public register(): void {
    this.auth0.authorize({
      login_hint: 'signUp'
    });
  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.localLogin(authResult);
        this.router.navigate(['/']);
      } else if (err) {
        console.error(err);

        this.lastErrorMessage = err.errorDescription;

        if (this.lastErrorMessage.indexOf('Please verify your email before logging in.') !== -1) {
          this.logout('/verify-email');
          // this.router.navigate(['/verify-email']);
        } else if (this.lastErrorMessage.indexOf('Access Denied') !== -1) {
          this.router.navigate(['/request-access']);
        } else {
          this.router.navigate(['/auth-error']);
        }

      }
    });
  }

  private localLogin(authResult): void {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    const expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this._accessToken = authResult.accessToken;
    this._idToken = authResult.idToken;
    this._expiresAt = expiresAt;

    this.getProfile();

    this.scheduleRenewal();
  }

  public renewTokens(): void {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.localLogin(authResult);
      } else if (err) {
        console.error(`Could not get a new token (${err.error}: ${err.error_description}).`);
        this.logout();
      }
    });
  }

  public scheduleRenewal() {
    if (!this.isAuthenticated()) { return; }
    this.unscheduleRenewal();

    const expiresAt = this._expiresAt;

    const expiresIn$ = of(expiresAt).pipe(
      mergeMap(
        expiresAt => {
          const now = Date.now();
          // Use timer to track delay until expiration
          // to run the refresh at the proper time
          return timer(Math.max(1, expiresAt - now));
        }
      )
    );

    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = expiresIn$.subscribe(
      () => {
        this.renewTokens();
        this.scheduleRenewal();
      }
    );
  }

  public unscheduleRenewal() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  public logout(returnPath: string = '/logged-out'): void {

    this.auth0.logout({
      client_id: environment.AUTH0_CLIENT_ID,
      returnTo: environment.APP_URL + returnPath
    });

    // Remove tokens and expiry time
    this._accessToken = '';
    this._idToken = '';
    this._expiresAt = 0;
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    this.unscheduleRenewal();
    // Go back to the home route
    // this.router.navigate(['/logged-out']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    return new Date().getTime() < this._expiresAt;
  }

  public waitForUserProfile(timeout?: number): Promise<Object> {
    return new Promise(resolve => {
      this._ngZone.runOutsideAngular( () => {
        this.recurseWaitForUserProfile(resolve, timeout);
      });
    });
  }


  public recurseWaitForUserProfile(resolve, timeout?: number) {
    const self = this;
    if (this.userProfile == null) {
        setTimeout(function() {self.recurseWaitForUserProfile(resolve, timeout); }, timeout);
    } else {
      // when while-loop breaks, resolve the promise to continue
      resolve(this.userProfile);
    }
  }

  public waitForAuthReady(): Promise<boolean> {
    return new Promise(resolve => {
      this._ngZone.runOutsideAngular(() => {this.recurseWaitForAuthReady(resolve); });
    });
  }

  private recurseWaitForAuthReady(resolve): void {
    const self = this;
    if (localStorage.getItem('isLoggedIn') === 'true' && this._accessToken === '') {
      setTimeout(function () {
        self.recurseWaitForAuthReady(resolve);
      }, 100);
    } else {
      // when while-loop breaks, resolve the promise to continue
      resolve(this.isAuthenticated());
    }
  }


  public getProfile(): Object {
    if (this.userProfile) {
      return this.userProfile;
    }

    if (!this._accessToken) {
      console.log('Access Token must exist to fetch profile');
      return;
    }

    const self = this;

    return this.auth0.client.userInfo(this._accessToken, function (err, profile) {
      if (profile) {
        self.userProfile = profile;
      }
    });

  }

}
