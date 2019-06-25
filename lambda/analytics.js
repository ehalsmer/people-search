'use strict';

const HttpClientUtils = require('./util.js');

const Mixpanel = require('mixpanel');

const httpClientUtils = new HttpClientUtils();



exports.sendUserInfo = (event,context,callback) => {

  console.debug("analytics.sendUserInfo event");
  console.debug(event);

  let queryParameters = getQueryParameters(event);
  let distinctId = queryParameters["emailAddress"];


  const mixpanel = Mixpanel.init(
    process.env.MIX_PANEL_KEY,
    {
      protocol: 'https'
    }
  );

  // create or update a user in Mixpanel Engage
  mixpanel.people.set(distinctId, {
      $email: distinctId
  }, function (err) {

    if(err != null) {
      console.error(err);
      httpClientUtils.sendResponse(callback, 500, err.message);
    } else {
      httpClientUtils.sendResponse(callback, 200, "");
    }
  });



};


exports.sendEvent = (event,context,callback) => {

  console.debug("analytics.sendEvent event");
  console.debug(event);

  let queryParameters = getQueryParameters(event);

  let eventProperties = queryParameters["options"] != null ? queryParameters["options"] : {};
  eventProperties["distinct_id"] = queryParameters["emailAddress"];

  if(event["requestContext"] != null
    && event["requestContext"["identity"] != null])
  eventProperties["ip"] = event["requestContext"]["identity"]["sourceIp"];

  console.log("MIX_PANEL_KEY: " + process.env.MIX_PANEL_KEY);

  const mixpanel = Mixpanel.init(
    process.env.MIX_PANEL_KEY,
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

};

function getQueryParameters(event) {
    if(event.isBase64Encoded) {
      let queryParametersString = new Buffer(event.body,"base64").toString("ascii") ;

      console.debug("Query Parameters String");
      console.debug(queryParametersString);

      return JSON.parse(queryParametersString.toString());
    } else {
      console.debug("found body");
      return event.body;
    }
}
