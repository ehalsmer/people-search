import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {AnalyticsService} from "../analytics.service";

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {

  public loadingComplete:boolean = false;

  constructor(public auth: AuthService, public analytics:AnalyticsService) {
    auth.handleAuthentication();
    auth.scheduleRenewal();

  }

  ngOnInit() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.auth.renewTokens();

      this.auth.waitForAuthReady().then(() =>{
        this.loadingComplete = true;
      })
    } else {
      this.loadingComplete = true;
    }

    this.auth.waitForUserProfile(1000).then(
      (user) => {
        this.analytics.sendUserInfo(user["name"]);

        // @ts-ignore
        let opts = window._sva = window._sva || {};

        opts.traits = {
            "user_id": user["name"],
            "email": user["name"]
        };
      }
    );

  }


}
