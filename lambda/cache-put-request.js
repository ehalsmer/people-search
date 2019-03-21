module.exports = class CachePutRequest {

  constructor(key,item) {
    this.key = key;
    this.item = item;
  }


  getKey() { return this.key }

  getItem() { return this.item }


};
