import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-logged-out',
  templateUrl: './logged-out.component.html',
  styleUrls: ['./logged-out.component.scss']
})
export class LoggedOutComponent implements OnInit {

  constructor(private auth:AuthService, private router: Router) { }

  ngOnInit() {
    this.auth.waitForAuthReady().then(() => {
          if(this.auth.isAuthenticated())
            this.router.navigate(["/"]);
    });

  }

}
