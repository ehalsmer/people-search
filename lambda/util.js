const ssm = require('aws-ssm-params');


module.exports = class HttpClientUtils {


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

    if(statusCode != 200) {
      console.error("There was an error. statusCode: " + statusCode + " body: " + body);
    }

    callback(null, response);

  }


  validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  validateUrl(url) {
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

  validatePhone(phone) {
    if(phone == null || phone == "")
      return false;

    let numbersOnly = phone.replace(/\D/g,'');
    if(numbersOnly.length < 10 ) {
      return false;
    }

    return true;

  }

  validateUserName(username) {
      if(username == null || username == "")
        return false;

      // Check for white space
      if (username.indexOf(" ") >= 0) {
          return false;
      }
      return true;
  }



};

