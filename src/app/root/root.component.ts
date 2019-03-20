import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth-service.service";
import {AnalyticsService} from "../analytics.service";

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {

  constructor(public auth: AuthService, public analytics:AnalyticsService) {
    auth.handleAuthentication();
    auth.scheduleRenewal();

  }

  ngOnInit() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.auth.renewTokens();
      this.auth.waitForAuthReady().then(
        ()=> {

          if(this.auth.isAuthenticated()) {
            this.auth.getProfile();

            this.auth.waitForUserProfile().then(
              (user) => {
                this.analytics.sendUserInfo(user["name"]);
              }
            );
          }

        }
      );
    }
  }

}
