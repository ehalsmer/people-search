'use strict';

const HttpClientUtils = require('./util.js');

const Mixpanel = require('mixpanel');

const httpClientUtils = new HttpClientUtils();

const mixpanel = Mixpanel.init(
  process.env.MIX_PANEL_KEY,
  {
    protocol: 'https'
  }
);


exports.sendUserInfo = (event,context,callback) => {

  console.debug("analytics.sendUserInfo event");
  console.debug(event);

  let queryParameters = httpClientUtils.getQueryParameters(event);
  let distinctId = queryParameters["emailAddress"];

  // create or update a user in Mixpanel Engage
  mixpanel.people.set(distinctId, {
      $created: (new Date()).toISOString(),
      $email: distinctId
  });

  httpClientUtils.sendResponse(callback, 200, "");

};


exports.sendEvent = (event,context,callback) => {

  console.debug("analytics.sendEvent event");
  console.debug(event);

  let queryParameters = httpClientUtils.getQueryParameters(event);

  let eventProperties = queryParameters["options"] != null ? queryParameters["options"] : {};
  eventProperties["distinct_id"] = queryParameters["emailAddress"];

  if(event["requestContext"] != null
    && event["requestContext"["identity"] != null])
  eventProperties["ip"] = event["requestContext"]["identity"]["sourceIp"];

  mixpanel.track(queryParameters["event"], eventProperties);

  httpClientUtils.sendResponse(callback, 200, "");


};
