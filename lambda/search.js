'use strict';

// search.js
const request = require('then-request');
const fs = require('fs');
const jwt = require( 'jsonwebtoken');
const HttpClientUtils = require('./util.js');
const httpClientUtils = new HttpClientUtils();


let defaultThumbnail = "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";

exports.thumbnail = (event,context,callback) => {

  console.debug(event);

  let tokensString = event.queryStringParameters["tokens"];

  if(tokensString == null
      || tokensString == ""
      || tokensString == "none") {
    sendThumbnail(defaultThumbnail,callback);
  }


  let tokens = tokensString.split(",");

  recurseThumbnails(0,tokens,callback);


};

function sendThumbnail(base64EncodedThumbnail, callback) {
  httpClientUtils.sendResponse(
      callback,
      200,
            base64EncodedThumbnail,
      {"Content-Type": "image/png"},
      true );
    return;
}

function recurseThumbnails(index, tokens, callback) {

  if(index >= tokens.length) {
    sendThumbnail(defaultThumbnail,callback);
    return;
  }

  let token = tokens[index++];

  let thumbnailurl = 'http://thumb.pipl.com/image?height=250&width=250&favicon=false&zoom_face=false&tokens=' + token;

  console.debug("thumbnail url");
  console.debug(thumbnailurl)

  // Attempt an HTTP Request
  request('GET', thumbnailurl)
    .done(function (res) {

      console.log(res);

    if(res.statusCode != 200) {
      recurseThumbnails(index, tokens, callback);
      return;
    }

    sendThumbnail(res.body.toString('base64'), callback);

  });

}

exports.query = (event, context, callback) => {

  console.debug(event);

  let queryParameters = httpClientUtils.getQueryParameters(event);

  console.debug("Query Parameters");
  console.debug(queryParameters);

  let query = queryParameters['q'];

  // Check the test-data path for a matching query file
  // This avoids charges against queries for known entities
  let path = "test-data/" + query + ".json";
  console.debug(query);

  try {
    if (fs.existsSync(path)) {
      fs.readFile(path, 'utf8', function(err, contents) {
        console.debug("reading from " + query + ".json");
        httpClientUtils.sendResponse(callback, 200, contents);
      });

    } else {
      // Get the query parameters
      httpClientUtils.getApplicationParameters("/pipl/").then(
       function(parameters) {

        let requestPromise =  request(
         'POST',
         makeQueryURL(queryParameters,parameters),
         makeQueryBody(queryParameters)
        );

        requestPromise.done((res) => {

          let responseBody = new String(res.getBody());

            httpClientUtils.sendResponse(callback, res.statusCode, responseBody);

        });
       },
       function() {
         // error
         httpClientUtils.sendResponse(callback, 500, "Could not read parameters");
       }
     );
    }
  } catch(err) {
    console.error("error while reading file: " + err);
    httpClientUtils.sendResponse(callback, 502, err);
    // do nothing
  }


};

function makeQueryBody(queryParameters) {

  let FormData = request.FormData;
  let data = new FormData();



    if(queryParameters['search_pointer'] != null) {
      data.append("search_pointer", queryParameters['search_pointer']);
    } else {

      let location = queryParameters['location'];
      let query = queryParameters['q'].trim();

      let fieldName = "raw_name";

      if(validateEmail(query)) {
        fieldName = "email";
      } else if(validateUrl(query)) {
        fieldName = "url";
      } else if (validatePhone(query)) {
        fieldName = "phone";
      } else if(validateUserName(query)) {
        fieldName = "username";
      }

      console.log("Field Name: " + fieldName);

      data.append(fieldName, query);

      data.append("show_sources","false");
      data.append("hide_sponsored", "true");

      if(location != null) {
        data.append("raw_address", location);
      }
    }

    return {form:  data};
}

function makeQueryURL(queryParameters,parameters) {

    let url = 'http://api.pipl.com/search/?key=';

    if(checkAuthentication(queryParameters))
      url += parameters['/pipl/business-key'];
    else
      url += parameters['/pipl/teaser-key'];

    console.debug("Pipl Query URL");
    console.debug(url);

    return url;
}





function checkAuthentication(queryParameters) {


  if(queryParameters["authToken"] == null
        || queryParameters["idToken"] == null) {
    return false;
  }

  /** FIXME This is not good - but I can't figure out how to validate JWTs */
  //return true;

  return   jwt.verify(queryParameters["idToken"],"-----BEGIN CERTIFICATE-----\n" +
    "MIIDCzCCAfOgAwIBAgIJcSHKniEXE/FnMA0GCSqGSIb3DQEBCwUAMCMxITAfBgNV\n" +
    "BAMTGGNvbm5lY3RvdXJraWRzLmF1dGgwLmNvbTAeFw0xOTAzMDQxNTQ1MjdaFw0z\n" +
    "MjExMTAxNTQ1MjdaMCMxITAfBgNVBAMTGGNvbm5lY3RvdXJraWRzLmF1dGgwLmNv\n" +
    "bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJzjda6SM9bniQi4UZXH\n" +
    "I/NryAZq9VUR+CmhBcfgZOjGfJsW5IdfUKDWZBM+SyT5nnI+YzZmXShz29AO7hrM\n" +
    "vUZVfFLGCVfWXX4EuIXJjNm13I0FhHpeU4kdG3w86EbfaBFY+KSamDgUlFokrVxL\n" +
    "qiLcbb2U6I8QYyZpG+3TI7Es3wtIMcmUEnIC1qZusZT+TiR4MIw1h+rDigXn6ot/\n" +
    "8SmlWYkHN4lEiX3y8vEmKyGiQSR99Qpr3nkN31qu61nLwAiNnEHRLLPejtPy3i7F\n" +
    "kqpU3S9F9nkUuO/wCUaGp4Bs21VOiCRtE0VghsEbaFDEOHxfxAL6s+1Ip3y0ewc1\n" +
    "j7MCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUfk3MumVh036J\n" +
    "M+689meF1hcT7skwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQAi\n" +
    "dadk93ytvFD4sS+ZhbtZkbrFrOEJLlDQTvLMq7gMy3XRPGx03dhGwQLO37vOGppg\n" +
    "Q6qd0bEOPDbOaw3ZCBFiqLi1HadtDU64bjGiAxJwlxA0HuPYZALP1nx9c7pkNe7W\n" +
    "zdMldEChuGDisp7ktfC6DC/qlwW6JWtVpEdPjC+y8QqbOYkjS/2qa7vpPAQ3UuNE\n" +
    "T7erFE7Pe6/j10eqI+PGGgeTkDkIdax/Bjl0osnY16dVnwJ1tWp1yLWnfYWjGWgJ\n" +
    "WIZnxsMdr5vKMyWR3TQ7+LgwIlwd0IZk8zv/Kx8ackSHKS33DWPexqWAp2Hi/C/6\n" +
    "AXw/ai4vXFcL4nZ80f+A\n" +
    "-----END CERTIFICATE-----\n");


}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateUrl(url) {
  if(url == null || url == "")
    return false;
  let regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(url))
        {
          return true;
        }
        else
        {
          return false;
        }
}

function validatePhone(phone) {
  if(phone == null || phone == "")
    return false;

  let numbersOnly = phone.replace(/\D/g,'');
  if(numbersOnly.length == 9 || numbersOnly.length == 10) {
    return true;
  }

}

function validateUserName(username) {
    if(username == null || username == "")
      return false;

    // Check for white space
    if (username.indexOf(" ") >= 0) {
        return false;
    }
    return true;
}
