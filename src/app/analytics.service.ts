import { Injectable } from '@angular/core';
import { AuthService } from "./auth-service.service";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {


  private emailAddress:string = "anonymous@unknown.org";

  constructor(private auth:AuthService,
              private http: HttpClient) {}

  sendUserInfo(emailAddress:string) {
    this.emailAddress = emailAddress;

    let headers = new HttpHeaders();
    headers.set("Content-Type","application/json; charset=utf-8");

    let bodyObject = new Object();
    bodyObject["emailAddress"] = emailAddress;

    this.http.post(
      environment.API_URL + "/api/sendUserInfo",
      JSON.stringify(bodyObject),
      {headers: headers}
    ).subscribe(
      (response) => {},
      (error) => {console.log(error)}
    );

  }

  sendEvent(verb:string, noun:string, outcome:string, options:object) {

    if(this.emailAddress == null) {
      console.warn("User email unknown, not sending analytic event");
      return;
    }

    let headers = new HttpHeaders();
    headers.set("Content-Type","application/json; charset=utf-8");

    let bodyObject = new Object();
    bodyObject["event"] = verb + "-" + noun + "-" + outcome;
    bodyObject["emailAddress"] = this.emailAddress;
    bodyObject["options"] = options;

    this.http.post(
      environment.API_URL + "/api/sendEvent",
      JSON.stringify(bodyObject),
      {headers: headers}
    ).subscribe(
      (response) => {},
      (error) => {console.log(error)}
    );
  }

}
