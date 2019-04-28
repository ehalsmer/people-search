import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../environments/environment";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AnalyticsService} from "../analytics.service";
import {Title} from "@angular/platform-browser";
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {


  ViewState = ViewState;
  viewState = ViewState.NO_SEARCH;

  SearchType = SearchType;
  searchType = SearchType.NAME;

  @ViewChild('header') header:HeaderComponent;

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
        && params["person"] == null) {
      this.router.navigate(["/"]);
      return;
    }

    this.viewState = ViewState.SEARCH_LOADING;


    let bodyObject = {};

    if(params["person"] != null) {
      bodyObject["person"] = params["person"];
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

  filterRelationships(relationships) {
    if(relationships == null)
      return [];

    let returnValue = [];

    for(let relationship of relationships) {


      returnValue.push(relationship);
    }


    return this.sortGeneric(returnValue);

  }

  relationshipClick(relationship) {

    let index = this.searchResult.person.relationships.indexOf(relationship);

    this.analytics.sendEvent("click","relationship",null,
        {
          "relationshipIndex": index
        }
    );

    this.router.navigate(['/search', { q: relationship.names[0].display}]);

    window.scroll(0,0);

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

  generatePersonLink(person) {
    return '/search;person=' + person['@search_pointer_hash'];
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

  personClick($event, person) {

    // Find the index of the person clicked
    const index = this.searchResult.possible_persons.indexOf(person);

    this.analytics.sendEvent("click","possible_person",null,
        {
          "possiblePersonIndex": index
        }
    );

    if($event.shiftKey
        || $event.metaKey)
      return;



    this.analytics.sendEvent("click","possible_person",null,
        {
          "possiblePersonIndex": index
        }
    );

    this.router.navigate(['/search', { person: person["@search_pointer_hash"]}]);

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
      this.header.openSocialWorkerCheckModal();
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
      this.header.openSocialWorkerCheckModal();
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
      this.header.openSocialWorkerCheckModal();
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
      this.header.openSocialWorkerCheckModal();
      return
    }

    window.location.href = "tel:" + phone.country_code + " " + phone.display;
  }

  generateAddressHomeStreetDisplay(address) {
    if(!this.auth.isAuthenticated()) {
      return "**** ********* **"
    }

    let returnValue = "";

    if(address.house != null)
      returnValue += address.house;

    if(address.street != null) {

      if(returnValue != "")
        returnValue += " ";

      returnValue += address.street;


    }

    return returnValue;
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

  authenticated() {
    return this.auth.isAuthenticated();
  }

  setSearchType(searchType: SearchType) {

    if (this.searchType === searchType) {
      return;
    }

    this.searchForm.get('searchInput').reset();
    this.searchForm.get('locationInput').reset();

    this.searchType = searchType;
  }

  generateSearchHint(searchType:SearchType) {
    if(searchType == SearchType.PHONE)
      return "Phone any format, no letters";

    if(searchType == SearchType.ADDRESS)
      return "Mailing address";

    if(searchType == SearchType.NAME)
      return "First and last, middle optional";

    if(searchType == SearchType.URL)
      return "Social profile link or any URL";

        if(searchType == SearchType.EMAIL)
      return "Email address";

    return "Unknown";
  }

}


enum ViewState {
  NO_SEARCH,
  SEARCH_LOADING,
  SEARCH_RESULT,
  SEARCH_ERROR,
  NO_RESULTS
}

enum SearchType {
  NAME,
  EMAIL,
  ADDRESS,
  PHONE,
  URL
}
