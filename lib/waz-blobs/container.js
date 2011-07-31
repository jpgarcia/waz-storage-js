var utils = require('../waz-storage/utils')
			, Blob = require('./blob');

var serviceInstance;

var Container = module.exports = exports = function Container(options) {
	// TODO: validate that a name is provided
	this.name = options.name;
	this.url = options.url;
	this.lastModified = options.lastModified;
	serviceInstance = options.serviceInstance;
}

Container.prototype.metadata = function(callback) {
	serviceInstance.getContainerProperties(this.name, function(err, data) {				
		callback(err, data);
	});
};

Container.prototype.putProperties = function(properties, callback) {
	serviceInstance.setContainerProperties(this.name, properties, function(err, data) {				
		callback(err, data);
	});
};

Container.prototype.getAcl = function(callback) {
	serviceInstance.getContainerAcl(this.name, function(err, data) {
		if (data == null) data = 'None';				
		callback(err, data);
	});
};

Container.prototype.setAcl = function(level, callback) {
	var container = this;
	serviceInstance.setContainerAcl(this.name, level, function(err, data) {
		callback(err, container);
	});
};

Container.prototype.blobs = function(callback) {
	serviceInstance.listBlobs(this.name, function(err, data) {
		var blobs = data.map(function(b){ return new Blob(b) });
		callback(err, blobs);
	});
};

Container.prototype.getBlob = function(name, callback) {
	var blobName = escape(name.replace(/^\//,''));
	var path = this.name + '/' + blobName;

	serviceInstance.getBlobProperties(path, function(err, data) {
		// TODO: error handling		
		var url = serviceInstance.generateRequestUri(path, {});		
		var blob = new Blob( { name: name, contentType: data['content-type'], url: url});
		callback(err, blob);
	});
};

Container.prototype.store = function(name, payload, contentType, metadata, callback) {
	var blobName = escape(name.replace(/^\//,''));
	var path = this.name + '/' + blobName;
	contentType = contentType || "application/octet-stream";
	serviceInstance.putBlob(path, payload, contentType, metadata, function(err, data) {
		// TODO: error handling		
		var url = serviceInstance.generateRequestUri(path, {});		
		var blob = new Blob( { name: name, contentType: contentType, url: url});
		callback(err, blob);
	});
};

exports.Service = require('./service');

exports.load = function(base) {
	options = base.defaultConnection.merge( { typeOfService: "blob"} );
	this.serviceInstance = new this.Service(options);
	return this;
}

exports.list = function(callback) {	
	var options = { serviceInstance: this.serviceInstance };
	
	this.serviceInstance.listContainers(options, function(err, data) {
		var result = null;
		
		if (!err) result = data.map(function(item) { 
			options = options.merge(item);
			return new Container(options); 
		});
					
		callback(err, result);
	});
}

exports.create = function(name, callback) {	
	// TODO: validate name format.
	var options = { serviceInstance: this.serviceInstance };
	
	this.serviceInstance.createContainer(name, function(err, data) {
		var result = null;
		
		if (!err) {
			options = options.merge(data);
			result = new Container(options);
		}

		callback(err, result);
	});
}

exports.delete = function(name, callback) {
	this.serviceInstance.deleteContainer(name, function(err) {
		callback(err, null);
	});
}

exports.find = function(name, callback) {
	var options = { serviceInstance: this.serviceInstance };

	this.serviceInstance.getContainerProperties(name, function(err, data) {
		var result = null
		
		if (!err) {
			options = options.merge({ name: name });			
			options = options.merge(data);			
			result = new Container(options);
		}
			
		callback(err, result);
	});
}