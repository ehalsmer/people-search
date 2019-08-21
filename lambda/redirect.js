
const HttpClientUtils = require('./util.js');
const httpClientUtils = new HttpClientUtils();

exports.redirect = (event,context,callback) => {

  let queryParameters = httpClientUtils.getQueryParameters(event);

  let _redirectUrl =  queryParameters["_redirectUrl"];
  delete queryParameters["_redirectUrl"];

  let headers = {
    Location: _redirectUrl + "?" + httpClientUtils.encodeQueryParameters(queryParameters)
  };

  httpClientUtils.sendResponse(callback, 302, "", headers, false );

};



