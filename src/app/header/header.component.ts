import {Component, ElementRef, OnInit, Output, ViewChild} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AnalyticsService} from "../analytics.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @ViewChild('socialWorkerCheckModal') socialWorkerCheckModal:ElementRef;
    @ViewChild('watchVideoModal') watchVideoModal:ElementRef;
    @ViewChild('videoModal') videoModal:ElementRef;

  constructor(
    private auth:AuthService,
    private router:Router,
    private analytics:AnalyticsService,
    private modal:NgbModal
  ) { }

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
    this.analytics.sendEvent("click","sign-up");
    this.openSocialWorkerCheckModal();
  }

  public openSocialWorkerCheckModal() {
    this.modal.open(this.socialWorkerCheckModal, {backdrop: 'static'});

  }

  yesIAmASocialWorkerClick() {
    this.analytics.sendEvent("click","yes-i-am-a-social-worker");

    this.modal.dismissAll();
    this.modal.open(this.watchVideoModal,{backdrop: 'static'});

  }

  openVideoClick() {
    this.analytics.sendEvent("click","watch-video");
    this.modal.dismissAll();

    this.modal.open(this.videoModal,  {
          size: 'lg',
          backdrop: 'static',
          centered: true,
          beforeDismiss:() => {
            this.analytics.sendEvent("close","introduction-video");
            return true;
          }});
  }

  dontWatchVideoClick() {
       this.analytics.sendEvent("click","do-not-watch-video");
       this.auth.register();
  }

  noIAmNotASocialWorkerClick() {
    this.analytics.sendEvent("click","i-am-not-a-social-worker");
    window.location.href = "https://www.connectourkids.org/findingfamilies";
  }

  postWatchVideoSignUp() {
      this.analytics.sendEvent("click","post-watch-video-sign-up");
      this.auth.register();
  }



}
