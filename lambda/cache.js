let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

let CacheGetResponse = require('./cache-response');

let docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
let tableName = 'pipl-cache';

module.exports = class Cache{

  put(key, value) {


    console.debug("Dynamo Put Key: " + key);

    console.debug("Dynamo Put Value: " + value);

    let params = {
      TableName: tableName,
      Item: {
        'queryHash': key,
        'queryResponse': JSON.stringify(value),
        'ttl': new Date().getTime() + (24 * 60 * 60)
      }
    };

    console.debug("Dynamo Put Params: " + JSON.stringify(params));

    return new Promise( resolve => {
      docClient.put(params, function(err, data) {
        if (err) {
          console.debug("Dynamo Put Error: " + err  + " data: " + data);
          resolve(false);
        } else {
          console.debug("Dynamo Put Success: " + JSON.stringify(data));
          resolve(true);
        }
      });
    });

  }

  get(key) {
    let params = {
     TableName: tableName,
     Key: {'queryHash': key}
    };

    console.debug("Dynamo Get Key: " + JSON.stringify(params));

    let self = this;

    return new Promise(resolve => {
      docClient.get(params, function(err, data) {
        console.debug("Dynamo Get Response: err: " + err + " data:" + JSON.stringify(data));
        if (err || self.isEmpty(data)) {
          resolve(new CacheGetResponse(false));
        } else {
          resolve(new CacheGetResponse(true,JSON.parse(data.Item.queryResponse)));
        }
      });
    });


  }


  isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

};


