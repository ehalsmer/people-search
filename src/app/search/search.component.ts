import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../environments/environment";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../auth-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AnalyticsService} from "../analytics.service";
import {Title} from "@angular/platform-browser";

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
    private analytics:AnalyticsService,
    private title:Title
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

  startOverClick() {
        this.router.navigate(['/']);
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
        this.title.setTitle("No results - " + environment.APP_NAME)
      } else {
        this.viewState = ViewState.SEARCH_RESULT;

        if(this.searchResult.person != null
            && this.searchResult.person.names != null) {

          let name = this.searchResult.person.names[0];

          let personName = name.first;
          if(name.middle != null && name.middle.trim().length > 0)
            personName += " " +name.middle;
          personName += " " + name.last;

          this.title.setTitle(personName + " - " + environment.APP_NAME);
        } else {
          let title = this.searchForm.get("searchInput").value;
          if(this.searchForm.get("locationInput").value != "")
            title += " - " + this.searchForm.get("locationInput").value
          this.title.setTitle("Search: " + title + " - " + environment.APP_NAME);
        }
      }

      this.analytics.sendEvent("search","person","success",
        {
          "possibleMatches": this.searchResult.possible_persons != null ? this.searchResult.possible_persons.length : 0,
          "personMatch": this.searchResult.person != null,
        }
      );

    }, (error) => {
        this.viewState = ViewState.SEARCH_ERROR;
        console.error("Error during person search");
        console.error(error);
        this.analytics.sendEvent("search","person", "failed", error);
      });
  }

  sortGeneric(items):[] {

    return items;
    return items.sort((aItem,bItem) => {
      if(aItem == bItem) {
        return;
      }

      let a = this.getLastSortDate(aItem);
      let b = this.getLastSortDate(bItem);

      return a>b ? -1 : a<b ? 1 : 0;

    });
  }

  getLastSortDate(item):Date {
    if(item == null)
      return new Date(0,0,0,0,0,0,0);

    if(item["@last_seen"] != null) {
      return new Date(item["@last_seen"]);
    }

    if(item["@valid_since"] != null) {
      return new Date(item["@valid_since"]);
    }

    return new Date(0,0,0,0,0,0,0);

  }

  filterPhones(phones) {
    return this.sortGeneric(phones);
  }

  filterAddresses(addresses) {
    return this.sortGeneric(addresses);
  }

  filterEmails(emails) {
    return this.sortGeneric(emails);
  }

  filterUrls(urls) {
    if(urls == null)
      return [];

    let returnValue = [];

    for(var i = 0; i < urls.length; i++) {
      let url = urls[i];

      if(url.url == null) {
        continue;
      }

      if(url["@name"] == null)
        continue;

      if(url["@sponsored"] === true)
        continue;

      returnValue.push(url);
    }

    return this.sortGeneric(returnValue);
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

    // Find the index of the person clicked
    let index = this.searchResult.possible_persons.indexOf(person);

    this.analytics.sendEvent("click","possible_person",null,
        {
          "possiblePersonIndex": index
        }
    );

    this.router.navigate(['/search', { search_pointer: person["@search_pointer"]}]);

  }

  translateWarningMessage(message) {
    if(message.indexOf("could not be parsed to a searchable address") != -1) {
      return "The location '" + this.searchForm.get('locationInput').value + "' was not recognized. Try entering a city name and two letter state abbreviation separated by a comma.";

    }
    return message;
  }

  urlClick(url) {

    let index = this.searchResult.person.urls.indexOf(url);

    this.analytics.sendEvent("click","person_url",null,
        {
          "urlIndex": index
        }
    );

    if(!this.auth.isAuthenticated()) {
      this.openAuthenticateModal();
      return
    }

    window.open(url.url, "_blank");

  }

  addressClick(address) {

    let index = this.searchResult.person.addresses.indexOf(address);

    this.analytics.sendEvent("click","person_address",null,
        {
          "addressIndex": index
        }
    );

    if(!this.auth.isAuthenticated()) {
      this.openAuthenticateModal();
      return
    }

    window.open("https://www.google.com/maps/search/?api=1&query=" + address.display, "_blank");

  }

  emailClick(email) {

    let index = this.searchResult.person.emails.indexOf(email);

    this.analytics.sendEvent("click","person_email",null,
        {
          "emailIndex": index
        }
    );

    if(!this.auth.isAuthenticated()) {
      this.openAuthenticateModal();
      return
    }

    window.location.href = "mailto:" + email.display;
  }

  phoneClick(phone) {

    let index = this.searchResult.person.phones.indexOf(phone);

    this.analytics.sendEvent("click","person_phone",null,
        {
          "phoneIndex": index
        }
    );

    if(!this.auth.isAuthenticated()) {
      this.openAuthenticateModal();
      return
    }

    window.location.href = "tel:" + phone.country_code + " " + phone.display;
  }

  generateAddressHomeStreetDisplay(address) {
    if(!this.auth.isAuthenticated()) {
      return "**** ********* **"
    }
    return address.house + " " + address.street;
  }


  generateAddressZipcodeDisplay(address) {
    if(!this.auth.isAuthenticated()) {
      return "****"
    }

    return address.zip_code;
  }

  generatePhoneDisplay(phone) {
    if(!this.auth.isAuthenticated()) {
      return phone.country_code + "-" + phone.display.substring(0,9) + "***";
    }
    return phone.country_code + "-" + phone.display;
  }

  openAuthenticateModal() {
    this.analytics.sendEvent("view","authenticate_modal");
    this.modal.open(this.authenticateModal);
  }

  openNoThanksModal() {
    this.analytics.sendEvent("view","no_thanks_modal");
    this.modal.open(this.noThanksModal);
  }

  authenticated() {
    return this.auth.isAuthenticated();
  }

  registerClick() {
    this.analytics.sendEvent("click","register");
    this.auth.register();
  }

  noThanksClick() {
    this.analytics.sendEvent("click","no_thanks");
    this.modal.dismissAll();
    this.openNoThanksModal();
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
