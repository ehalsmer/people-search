'use strict';

const HttpClientUtils = require('./util.js');

const Mixpanel = require('mixpanel');
const ssm = require('aws-ssm-params');

const httpClientUtils = new HttpClientUtils();
const mixpanel = Mixpanel.init(
  'b9a9e2166ffab78cf848bea81a69e61b',
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

  let eventProperties = queryParameters["options"];
  eventProperties["distinct_id"] = queryParameters["emailAddress"];
  eventProperties["ip"] = event["requestContext"]["identity"]["sourceIp"];

  mixpanel.track(queryParameters["event"], eventProperties);

  httpClientUtils.sendResponse(callback, 200, "");


};
