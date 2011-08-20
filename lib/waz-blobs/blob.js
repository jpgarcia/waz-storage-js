var utils = require('../waz-storage/utils');

var serviceInstance;

var Blob = module.exports = exports = function Blob(options) {
	this.name = options.name;
	this.url = options.url;
	this.contentType = options.contentType;
	this.path = this.url.replace(/https?:\/\/[^\/]+\//i, '').match(/([^&]+)/i)[1];	
	serviceInstance = options.serviceInstance;
};

Blob.prototype.properties = function(callback) {
	serviceInstance.getBlobProperties(this.path, function(err, data) {				
		callback(err, data);
	});
};

Blob.prototype.metadata = function(callback) {
	serviceInstance.getBlobMetadata(this.path, function(err, data) {				
		callback(err, data);
	});
};

Blob.prototype.putProperties = function(properties, callback) {
	serviceInstance.setBlobProperties(this.path, properties, function(err) {
		callback(err);
	});
};

Blob.prototype.putMetadata = function(metadata, callback) {
	serviceInstance.setBlobMetadata(this.path, metadata, function(err) {				
		callback(err);
	});
};

Blob.prototype.getContents = function(callback){
	serviceInstance.getBlob(this.path, function(err, data) {
		callback(err, data);
	});
};

Blob.prototype.destroy = function(callback){
	serviceInstance.deleteBlob(this.path, function(err) {
		callback(err);
	});
};

Blob.prototype.copy = function(destination, callback){	
	serviceInstance.copyBlob(this.path, destination, function(err) {
		if (!err) {
			serviceInstance.getBlobProperties(destination, function(err, data){
				var blob = new Blob({name: destination, url: serviceInstance.generateRequestUri(destination) , contentType: data['Content-Type'], serviceInstance: serviceInstance})
				callback(err, blob);	
			});
		} else {
			callback(err, null)
		}		
	});
};