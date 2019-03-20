import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth-service.service";
import {Router} from "@angular/router";
import {AnalyticsService} from "../analytics.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    private auth:AuthService,
    private router:Router,
    private analytics:AnalyticsService) { }

  ngOnInit() {
  }

  login() {
    this.analytics.sendEvent("click","login");
    this.auth.login();
  }
  logout() {
    this.analytics.sendEvent("click","logout");
    this.auth.logout();
  }

  logoClick() {
    this.analytics.sendEvent("click","logo");
    this.router.navigate(["/"]);
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  register() {
    this.analytics.sendEvent("click","register");

    this.auth.register();
  }

}
