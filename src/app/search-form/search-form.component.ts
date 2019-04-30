import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {EnumValue} from '@angular/compiler-cli/src/ngtsc/metadata';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {


  searchForm = new FormGroup({
    main: new FormControl('', Validators.minLength(1)),
    location: new FormControl('')
  });

  //  addressSearchForm = new FormGroup({
//    address: new FormControl('', Validators.minLength(1))
//  });
//  });
//  emailSearchForm = new FormGroup({
//    email: new FormControl('', Validators.email)
//  });
//  });
//  phoneNumberSearchForm = new FormGroup({
//    phoneNumber: new FormControl('', Validators.minLength(10))
//  });
//  });
//  urlSearchForm = new FormGroup({
//    url: new FormControl('', Validators.pattern('/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;'))
//  });

  private sub = null;

  SearchType = SearchType;
  searchType = SearchType.NAME;


  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.parametersChanged(params);
    });
  }

  onSearch() {

    switch (this.searchType) {

      case SearchType.NAME:
        this.onSearchName();
        break;

      case SearchType.EMAIL:
        this.onSearchEmail();
        break;

      case SearchType.URL:
        this.onSearchUrl();
        break;

      case SearchType.ADDRESS:
        this.onSearchAddress();
        break;

      case SearchType.PHONE:
        this.onSearchPhone();
        break;

      default:
        console.error('Unknown type:' + this.searchType);
        this.onSearchName();

    }


  }

  onSearchPhone() {
    const phone = this.searchForm.get('main').value;
    this.router.navigate(['/search', { m: phone, t: this.searchType.toString()}]);
  }

  onSearchAddress() {
    const address = this.searchForm.get('main').value;
    this.router.navigate(['/search', { m: address, t: this.searchType.toString()}]);
  }

  onSearchUrl() {
    const url = this.searchForm.get('main').value;

    this.router.navigate(['/search', { m: name, t: this.searchType.toString()}]);

  }

  onSearchEmail() {
    const name = this.searchForm.get('main').value;

    this.router.navigate(['/search', { m: name, t: this.searchType.toString()}]);

  }

  onSearchName() {

    const name = this.searchForm.get('main').value;
    const location = this.searchForm.get('location').value;

    this.router.navigate(['/search', { m: name, l: location , t: this.searchType.toString()}]);
  }

  startOverClick() {
        this.router.navigate(['/']);
  }



  parametersChanged(params) {


    if (params['t'] != null) {
      this.searchType = params['t'];
    } else {
      this.router.navigate(['/']);
    }

    switch (this.searchType) {

      case SearchType.NAME:
        this.parametersChangedName(params);
        break;

      case SearchType.EMAIL:
        this.parametersChangedEmail(params);
        break;

      case SearchType.URL:
        this.parametersChangedUrl(params);
        break;

      case SearchType.ADDRESS:
        this.parametersChangedAddress(params);
        break;

      case SearchType.PHONE:
        this.parametersChangedPhone(params);
        break;

      default:
        console.error('Unknown type:' + this.searchType);

    }


  }

  parametersChangedPhone(params: String[]) {
    this.searchForm.get('main').setValue(params['m']);
    this.searchForm.get('location').setValue('');
  }

  parametersChangedAddress(params: String[]) {
    this.searchForm.get('main').setValue(params['m']);
    this.searchForm.get('location').setValue('');
  }

  parametersChangedUrl(params: String[]) {
    this.searchForm.get('main').setValue(params['m']);
    this.searchForm.get('location').setValue('');
  }

  parametersChangedEmail(params: String[]) {
    this.searchForm.get('main').setValue(params['m']);
    this.searchForm.get('location').setValue('');
  }

  parametersChangedName(params: String[]) {

    this.searchForm.get('main').setValue(params['m']);
    this.searchForm.get('location').setValue(params['l']);

  }

  setSearchType(searchType: SearchType) {

    if (this.searchType === searchType) {
      return;
    }

    this.searchForm.get('main').reset();
    this.searchForm.get('location').reset();

    this.searchType = searchType;

  }

  generateSearchHint(searchType: SearchType) {
    if (searchType === SearchType.PHONE) {
      return 'Phone any format, no letters';
    }

    if (searchType === SearchType.ADDRESS) {
      return 'Mailing address';
    }

    if (searchType === SearchType.NAME) {
      return 'First and last, middle optional';
    }

    if (searchType === SearchType.URL) {
      return 'Social profile link or any URL';
    }

    if (searchType === SearchType.EMAIL) {
      return 'Email address';
    }

    return '';
  }

  getTitle() {
    let title = this.searchForm.get('main').value;
    if (this.searchForm.get('location').value !== '') {
      title += ' - ' + this.searchForm.get('location').value;
    }
    return title;
  }

  getSearchObject() {

    let searchType = null;

    const searchTypeString: string = this.route.paramMap.source.getValue()['t'];

    if ( searchTypeString != null ) {
      searchType = this.SearchType[searchTypeString.toUpperCase()];
    }

    if (searchType == null) {
      return {};
    }

    let searchObject = {};

    if ( searchType === SearchType.NAME) {

      searchObject = { names: [{raw: this.route.paramMap.source.getValue()['m']}]};

      const locationValue = this.route.paramMap.source.getValue()['l'];

      if (locationValue != null
        && locationValue !== '') {
        searchObject['addresses'] = [{raw: locationValue}];
      }

    } else if ( searchType === SearchType.EMAIL) {

      searchObject = { emails: [{address: this.route.paramMap.source.getValue()['m']}]};

    }  else if ( searchType === SearchType.PHONE) {

      searchObject = { phones: [{number: this.route.paramMap.source.getValue()['m']}]};

    }  else if ( searchType === SearchType.ADDRESS) {

      searchObject = { addresses: [{raw: this.route.paramMap.source.getValue()['m']}]};

    }  else if ( searchType === SearchType.ADDRESS) {

      searchObject = { addresses: [{raw: this.route.paramMap.source.getValue()['m']}]};

    }

    console.debug('Search Object for ' + searchType);
    console.debug(searchObject);

    return searchObject;

  }
}


enum SearchType {
  NAME = 'name',
  EMAIL = 'email',
  ADDRESS = 'address',
  PHONE = 'phone',
  URL = 'url',
  PERSON = 'person' // For deeplinking to a specific person
}
