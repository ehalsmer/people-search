import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';

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

    this.router.navigate(['/search', { m: encodeURI(url), t: this.searchType.toString()}]);

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
      this.searchType = SearchType.NAME;
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

      case SearchType.PERSON:
        this.parametersChangedPerson(params);
        break;

      default:
        console.error('Unknown type:' + this.searchType);

    }


  }

  parametersChangedPerson(params: String[]) {

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


  getSearchObject(parameters: Params) {

    if (parameters['person'] != null) {
      return {search_pointer_hash: parameters['person']};
    }

    let searchType = null;

    const searchTypeString: string = parameters['t'];

    if ( searchTypeString != null ) {
      searchType = this.SearchType[searchTypeString.toUpperCase()];
    }

    if (searchType == null) {
      return {};
    }

    let searchObject = {};

    if ( searchType === SearchType.NAME) {

      searchObject = { names: [{raw: parameters['m']}]};

      const locationValue = parameters['l'];

      if (locationValue != null
        && locationValue !== '') {
        searchObject['addresses'] = [{raw: locationValue}];
      }

      if ( parameters['r'] != null ) {
        searchObject['relationships'] = [{names: [{raw: parameters['r']}]}];
      }

    } else if ( searchType === SearchType.EMAIL) {

      searchObject = { emails: [{address: parameters['m']}]};

    }  else if ( searchType === SearchType.PHONE) {

      const phoneNumbersOnly = (<String> parameters['m']).replace(/[^0-9\.]+/g, '')

      searchObject = { phones: [{number: phoneNumbersOnly}]};

    }  else if ( searchType === SearchType.ADDRESS) {

      searchObject = { addresses: [{raw: parameters['m']}]};

    }  else if ( searchType === SearchType.URL) {

      searchObject = { urls: [{url: decodeURI(parameters['m'])}]};

    }

    return searchObject;

  }
}


export enum SearchType {
  NAME = 'name',
  EMAIL = 'email',
  ADDRESS = 'address',
  PHONE = 'phone',
  URL = 'url',
  PERSON = 'person' // For deeplinking to a specific person
}
