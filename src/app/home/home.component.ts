import { Component, OnInit } from '@angular/core';
import { HttpClient} from "@angular/common/http";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {environment} from "../../environments/environment";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  searchInput;

  searchForm = new FormGroup({
    searchInput: new FormControl('', Validators.minLength(1)),
    locationInput: new FormControl('',)
  });

  constructor(
    private http: HttpClient,
    private router:Router,
    private title:Title) { }

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


}
