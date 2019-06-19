import { Injectable } from '@angular/core';
import {AnalyticsService} from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class ChildServedService {

  constructor(
    private analytics: AnalyticsService
  ) { }


  public childServed() {
        this.analytics.sendEvent('served', 'child', 'success');
  }
}
