const ssm = require('aws-ssm-params');


module.exports = class HttpClientUtils {
  getQueryParameters(event) {
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


/** Returns the AWS parameters configured for the environment */
  getApplicationParameters(path) {

    let ssmParams = {
        Path: path,
        WithDecryption: true
    };

    let awsParams = {region: 'us-east-1'};


    return new Promise(function(resolve, reject){
      ssm(ssmParams,awsParams)
        .then(function(parameters){
        resolve(parameters);
      },function(err){
        reject(err);
      })

    });

  }

  sendResponse(callback, statusCode, body, headers = {}, bodyBase64Encoded = false) {

    const response = {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: body,
      isBase64Encoded:bodyBase64Encoded
    };

    Object.keys(headers).forEach(function(key) {
      response.headers[key] = headers[key];
    });

    callback(null, response);

  }
};

