'use strict';

const auth0 = require('auth0');

const Mixpanel = require('mixpanel');

const Secrets = require('./secrets.js');
const secrets = new Secrets();

const HttpClientUtils = require('./util.js');
const httpClientUtils = new HttpClientUtils();



exports.sendUserInfo = (event,context,callback) => {

  console.debug("analytics.sendUserInfo event");
  console.debug(event);

  let queryParameters = httpClientUtils.getQueryParameters(event);
  let distinctId = queryParameters["emailAddress"];

  let ip = "";

  if(event["requestContext"] != null
    && event["requestContext"]["identity"] != null)
    ip = event["requestContext"]["identity"]["sourceIp"];


  if(queryParameters["idToken"] != null
      && httpClientUtils.checkAuthentication(queryParameters)) {

    console.debug("Found idToken");

    let idToken = queryParameters["idToken"];

    let userDataToken = idToken.split(".")[1];
    let userDataJsonString = new Buffer(userDataToken, 'base64').toString('ascii');
    let userData = JSON.parse(userDataJsonString);

    console.debug("User data");
    console.debug(userData);

    sendMixPanelUserInfo(distinctId, ip, userData.given_name, userData.family_name, callback);


  } else {
    sendMixPanelUserInfo(distinctId,ip, null, null, callback);
  }






};


exports.sendEvent = (event,context,callback) => {

  console.debug("analytics.sendEvent event");
  console.debug(event);

  let queryParameters = httpClientUtils.getQueryParameters(event);

  let eventProperties = queryParameters["options"] != null ? queryParameters["options"] : {};
  eventProperties["distinct_id"] = queryParameters["emailAddress"];


  secrets.getMixPanelKey().then(
    function(mixPanelKey) {

      const mixpanel = Mixpanel.init(
        mixPanelKey,
        {
          protocol: 'https',
          verbose: true
        },
      );

      mixpanel.track(
        queryParameters["event"],
        eventProperties,
        function (err) {
          if(err != null) {
            console.error("Error sending event: " + queryParameters["event"]);
            console.error(err);
            httpClientUtils.sendResponse(callback, 500, err.message);
            return;
          }

          else if(queryParameters["event"].startsWith("search-person")) {
            mixpanel.people.increment(queryParameters["emailAddress"], 'search-person',
              function (err) {
                if(err != null) {
                  console.error("Error sending increment: search-person");

                  console.error(err);

                  httpClientUtils.sendResponse(callback, 500, err.message);
                  return;
                }
                httpClientUtils.sendResponse(callback, 200, "");
              });
          } else {
            httpClientUtils.sendResponse(callback, 200, "");

          }

        });

    },
    function(error) {
      console.error("There was a problem fetching the mixpanel key: " + error);
    }
  )





};


function sendMixPanelUserInfo(emailAddress, ip, firstName, lastName, callback) {

  console.debug("sendMixPanelUserInfo");
  console.debug("name: " + firstName + " " + lastName);

  secrets.getMixPanelKey().then(
    function(key){

      // Get the user info from auth0
    const mixpanel = Mixpanel.init(
      key,
      {
        protocol: 'https'
      }
    );

    let properties = {
        $email: emailAddress
    };

    if(firstName != null
      && firstName.trim() != "") {
      properties.$first_name = firstName;
    }

    if(lastName != null
      && lastName.trim() != "") {
      properties.$last_name = lastName;
    }

    properties.$ip = ip;

    // create or update a user in Mixpanel Engage
    mixpanel.people.set(emailAddress, properties, function (err,response) {

      if(err != null) {
        console.error(err);
        httpClientUtils.sendResponse(callback, 500, err.message);
      } else {
        console.debug(response);
        httpClientUtils.sendResponse(callback, 200, "");
      }
    });


    }, function (error) {
      console.error("Error getting mixpanel key for sendMixPanelInfo: " + error);
    }
  )



}
