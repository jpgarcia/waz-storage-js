var utils = require('../waz-storage/utils');

var serviceInstance;

var Blob = module.exports = exports = function Blob(options) {
	this.name = options.name;
	this.url = options.url;
	this.contentType = options.contentType;
	this.path = this.url.replace(/https?:\/\/[^\/]+\//i, '').match(/([^&]+)/i)[1]
	
	serviceInstance = options.serviceInstance;
}

Blob.prototype.getContents = function(callback){
	serviceInstance.getBlob(this.path, function(err, data) {
		callback(err, data);
	});
}
