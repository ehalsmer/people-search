import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HttpClient} from "@angular/common/http";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {environment} from "../../environments/environment";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AnalyticsService} from "../analytics.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  searchInput;

  @ViewChild('videoModal') videoModal:ElementRef;

  searchForm = new FormGroup({
    searchInput: new FormControl('', Validators.minLength(1)),
    locationInput: new FormControl('',)
  });

  constructor(
    private http: HttpClient,
    private router:Router,
    private title:Title,
    private modal:NgbModal,
    private analytics:AnalyticsService
    ) { }

  ngOnInit(){
    this.title.setTitle(environment.APP_NAME);
  }

  ngAfterViewInit() {
  }

  onSearch() {

    let searchValue = this.searchForm.get('searchInput').value;
    let locationValue = this.searchForm.get('locationInput').value;

    this.router.navigate(['/search', { q: searchValue, location: locationValue }]);

  }
  openVideo() {

      this.analytics.sendEvent("open","introduction-video");

        this.modal.open(this.videoModal,  {
          size: 'lg',
          centered: true,
          beforeDismiss:() => {
            this.analytics.sendEvent("close","introduction-video");
            return true;
          }});
  }


}
