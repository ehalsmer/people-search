import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';
import {AnalyticsService} from '../analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {

  public loadingComplete = false;

  constructor(public auth: AuthService, public analytics: AnalyticsService) {
    auth.handleAuthentication();
    auth.scheduleRenewal();

  }

  ngOnInit() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.auth.renewTokens();

      this.auth.waitForAuthReady().then(() => {
        this.loadingComplete = true;
      });
    } else {
      this.loadingComplete = true;
    }

    this.auth.waitForUserProfile(1000).then(
      (user) => {
        this.analytics.sendUserInfo(user['email']);

        if (user['name'] !== 'anonymous@unknown.org') {

          // @ts-ignore
          const opts = window._sva = window._sva || {};

          opts.traits = {
              'user_id': user['name'],
              'email': user['name']
          };

          /*let s = document.createElement('script');
          s.src = '//survey.survicate.com/workspaces/8e9be799b0c965ff90b58c89ee13f75f/web_surveys.js';
          s.async = true;
          let e = document.getElementsByTagName('script')[0];
          e.parentNode.insertBefore(s, e);*/

        }



      }
    );

  }


}
