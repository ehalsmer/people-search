import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private auth:AuthService, private router:Router) { }

  ngOnInit() {
  }

  login() {
    this.auth.login();
  }
  logout() {
    this.auth.logout();
  }

  logoClick() {
    this.router.navigate(["/"]);
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  register() {
    this.auth.register();
  }

}
