const awsParamStore = require( 'aws-param-store' );

const cache = {};

function fetchValue(key) {
    console.log(key);
    let finalKey = key.replace("$ENV",process.env.STAGE);

    console.log(finalKey);

    if(cache[finalKey] != null)
      return new Promise(function(accept,reject){
        accept(cache[finalKey]);
      });

    return new Promise(function(accept, reject)
    {
      awsParamStore.getParameter(finalKey)
        .then((parameter) => {
          accept(parameter.Value)

        }, (error) => {
          console.error("Error fetching key " + finalKey + " message is: " + error);
          reject(error);
        });
    });

  }

module.exports = class Secrets {
  // add $ENV to have the value replaced

  getMixPanelKey() {
    return fetchValue('/people-search/mixpanel/$ENV-key');
  }
};
