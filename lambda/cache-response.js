
module.exports = class CacheGetResponse {


  constructor(success, item) {
    this.success = success;
    this.item = item;
  }

  getSuccess(){
    return this.success;
  }

  getItem() {
    return this.item;
  }

};
