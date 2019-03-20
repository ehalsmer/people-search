import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../environments/environment";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../auth-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AnalyticsService} from "../analytics.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {


  ViewState = ViewState;
  viewState = ViewState.NO_SEARCH;

  @ViewChild('authenticateModal') authenticateModal:ElementRef;
  @ViewChild('noThanksModal') noThanksModal:ElementRef;

  searchForm = new FormGroup({
    searchInput: new FormControl('', Validators.minLength(1)),
    locationInput: new FormControl('',)
  });

  searchResult = null;

  private sub = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private auth:AuthService,
    private modal:NgbModal,
    private analytics:AnalyticsService
  ) { }


  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.parametersChanged(params);
    });
  }

  ngOnDestroy() {

  }


  onSearch() {

    let searchValue = this.searchForm.get('searchInput').value;
    let locationValue = this.searchForm.get('locationInput').value;

    this.router.navigate(['/search', { q: searchValue, location: locationValue }]);


  }

  parametersChanged(params) {

    let searchInputValue = (params["q"] != null) ? params['q'] : "";
    let locationInputValue = (params["location"] != null) ? params['location'] : "";

    this.searchForm.setValue({"searchInput": searchInputValue,"locationInput": locationInputValue });

    if( (params["q"] == null || params["q"].trim() == "")
        && params["search_pointer"] == null) {
      this.router.navigate(["/"]);
      return;
    }

    this.viewState = ViewState.SEARCH_LOADING;


    let bodyObject = {};

    if(params["search_pointer"] != null) {
      bodyObject["search_pointer"] = params["search_pointer"];
    } else {
      if(params["q"] != null && params["q"].trim() != "") {
        bodyObject["q"] = params["q"];
      }

      if(params["location"] != null && params["location"].trim() != "") {
        bodyObject["location"] = params["location"];
      }
    }

    // Wait until the authentication time is ready
    this.auth.waitForAuthReady().then(
      authenticated => {
      this.fetchSearchPostWaitForAuth(bodyObject,authenticated)
    });

  }

  fetchSearchPostWaitForAuth(bodyObject,authenticated) {

    if(authenticated) {
      bodyObject["authToken"] = this.auth.accessToken;
      bodyObject["idToken"] = this.auth.idToken;
    }

    let searchUrl = environment.API_URL + "/api/query";

    let headers = new HttpHeaders();
    headers.set("Content-Type","application/json; charset=utf-8");

    let responseObservable =  this.http.post(
      searchUrl,
      JSON.stringify(bodyObject),
      {headers: headers}
    );

    responseObservable.subscribe( (response ) => {
      console.debug("Response");
      console.debug(response);
      this.searchResult = response;

      if(this.searchResult.person == null
        && this.searchResult.possible_persons == null) {
        this.viewState = ViewState.NO_RESULTS;
      } else {
        this.viewState = ViewState.SEARCH_RESULT;
      }

      this.analytics.sendEvent("search","person","success",
        {
          "possibleMatches": this.searchResult.possible_persons != null ? this.searchResult.possible_persons.length : 0,
          "personMatch": this.searchResult.person != null,
        });

    }, (error) => {
        this.viewState = ViewState.SEARCH_ERROR;
        console.error("Error during person search");
        console.error(error);
        this.analytics.sendEvent("search","person", "failed", error);
      });
  }

  filterUrls(urls) {
    if(urls == null)
      return [];

    let returnValue = [];

    for(var i = 0; i < urls.length; i++) {
      let url = urls[i];

      if(url.url == null) {

      }

      if(url["@domain"].indexOf("beenverified.com") != -1)
        continue;

      if(url["@domain"].indexOf("instantcheckmate.com") != -1)
        continue;

      returnValue.push(url);
    }

    return returnValue;
  }


  generateProfileUrl(profile) {

    let values = profile.content.split("@");

    if(values[1] == "facebook") {
      return "https://www.facebook.com/" + values[0];
    }

    if(values[1] == "linkedin") {
      return "https://www.linkedin.com/in/" + values[0];
    }

    if(values[1] == "google") {
      return " https://plus.google.com/" + values[0] + "/posts"
    }

    return "";


  }

  generateProfileName(profile) {
        let values = profile.content.split("@");

    if(values[1] == "facebook") {
      return "Facebook";
    }

    if(values[1] == "linkedin") {
      return "Linked-In";
    }

    if(values[1] == "google") {
      return "Google Plus"
    }

    return values[0] + "@" + values[1];
  }

  uniqueCityStates(addresses) {

    let returnValues = [];

    if(addresses == null)
      return returnValues;

    for(var i = 0; i < addresses.length; i++) {
      let address = addresses[i];
      let value = (address.city != null) ? address.city : "";

      if(address.state != null && address.state != "") {
        if(value != "") {
          value += ",";
        }

        value += address.state;
      }

      if(returnValues.indexOf(value) == -1)
        returnValues.push(value);
    }

    return returnValues;
  }

  logoClick() {
    this.router.navigate(["/"]);
  }

  generateThumbnailUrl(person) {
    if(person.images == null || person.images.length == 0) {
      return environment.API_URL + "/api/thumbnail?tokens=none";
    }

    let tokens = "";
    person.images.forEach((image) => {
      if(tokens != "")
      tokens += ",";

      tokens += image.thumbnail_token;
    });

    let url =  environment.API_URL + "/api/thumbnail?tokens=" + tokens;

    console.log(url);

    return url;
  }

  personClick(person) {
        this.router.navigate(['/search', { search_pointer: person["@search_pointer"]}]);

  }

  translateWarningMessage(message) {
    if(message.indexOf("could not be parsed to a searchable address") != -1) {
      return "The location '" + this.searchForm.get('locationInput').value + "' was not recognized. Try entering a city name and two letter state abbreviation separated by a comma.";

    }
    return message;
  }

  urlClick(url) {
    if(!this.auth.isAuthenticated()) {
      this.modal.open(this.authenticateModal);
      return
    }

    window.open(url.url, "_blank");

  }

  addressClick(address) {
    if(!this.auth.isAuthenticated()) {
      this.modal.open(this.authenticateModal);
      return
    }

    window.open("https://www.google.com/maps/search/?api=1&query=" + address.display, "_blank");

  }

  emailClick(email) {
    if(!this.auth.isAuthenticated()) {
      this.modal.open(this.authenticateModal);
      return
    }

    window.location.href = "mailto:" + email.display;
  }

  phoneClick(phone) {
    if(!this.auth.isAuthenticated()) {
      this.modal.open(this.authenticateModal);
      return
    }

    window.location.href = "tel:" + phone.country_code + " " + phone.display;
  }

  generatePhoneDisplay(phone) {
    if(!this.auth.isAuthenticated()) {
      return phone.country_code + "-" + phone.display.substring(0,9) + "***";
    }
    return phone.country_code + "-" + phone.display;
  }

  openAuthenticateModal() {
    this.modal.open(this.authenticateModal);

  }

  authenticated() {
    return this.auth.isAuthenticated();
  }

  registerClick() {
    this.auth.register();
  }

  noThanksClick() {
    this.modal.dismissAll();
    this.modal.open(this.noThanksModal);
  }

  closeModal() {
    this.modal.dismissAll();
  }
}


enum ViewState {
  NO_SEARCH,
  SEARCH_LOADING,
  SEARCH_RESULT,
  SEARCH_ERROR,
  NO_RESULTS
}
