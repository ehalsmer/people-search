let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

let CacheGetResponse = require('./cache-response');
let CachePutRequest = require( './cache-put-request');

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
let tableName = 'pipl-search-pointers';

module.exports = class SearchPointersCache {



  get(key) {
    let params = {
     TableName: tableName,
     Key: {'search_pointer_hash': {"S": key}}
    };

    console.debug("Dynamo Get Key: " + JSON.stringify(params));

    let self = this;

    return new Promise(resolve => {
      ddb.getItem(params, function(err, data) {
        console.debug("Dynamo Get Response: err: " + err + " data:" + JSON.stringify(data));
        if (err || self.isEmpty(data)) {
          resolve(new CacheGetResponse(false));
        } else {
          resolve(new CacheGetResponse(true,data.Item.search_pointer.S));
        }
      });
    });
  }

  /** A set of CachePutRequests */
  put(cachePutRequests) {

    let params = {RequestItems: {}};

    let items = [];

    ;

    for(let putRequest of cachePutRequests) {

      items.push( {
        PutRequest: {
          Item: {
            "search_pointer_hash": { "S": putRequest.getKey() },
            "search_pointer": { "S": putRequest.getItem() },
            "ttl": {"N": (Math.round(new Date().getTime()/1000) + (60 * 60 * 24 * 365)).toString()} //save for a year
           }
         }
      });

    }

    console.debug("Search Pointers Puts");
    console.debug(params);

    return new Promise(resolve => {
      this.sendPutBatch(params, items, resolve);
    });


  }

  sendPutBatch(params, items, resolve) {

    let self = this;

    let sendItems = items;

    if(items.length > 25) {
      sendItems = items.slice(0,25);
      items = items.slice(25,items.length - 1);
    } else {
      sendItems = items;
      items = [];
    }

    params.RequestItems[tableName] = sendItems;

    ddb.batchWriteItem(params, function(err, data) {
        if (err) {
          console.log("Error writing search pointers cache", err);
          resolve(true);
        } else {
          console.log("Success writing search pointers cache", data);

          if(items.length > 0) {
            self.sendPutBatch(params, items, resolve);
          } else {
            resolve(false);
          }

        }
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
