import { Component, OnInit } from '@angular/core';
import {AnalyticsService} from '../analytics.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  year = new Date().getFullYear();

  constructor(
    private router: Router,
    private analytics: AnalyticsService

  ) { }

  ngOnInit() {
  }

  privacyClick() {
    this.analytics.sendEvent('click', 'privacy');
    this.router.navigate(['/privacy']);
    window.scrollTo(0, 0);
  }

  termsClick() {
    this.analytics.sendEvent('click', 'terms');
    this.router.navigate(['/terms']);
    window.scrollTo(0, 0);
  }

}

