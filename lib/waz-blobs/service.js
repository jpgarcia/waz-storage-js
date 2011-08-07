var utils = require('../waz-storage/utils')
	, xml2js = require('xml2js')
	, CoreService = require('../waz-storage/core-service');

exports = module.exports = Service;

function Service(options) {
	this.options = options;
	this.coreService = new CoreService(options);
}

Service.prototype.listContainers = function(args, callback){ 
	var options =  {comp: 'list'};
	
	this.coreService.execute('get', null, options, null, null, function(err, response) {
		if (err != null && err.statusCode == 404) {
			callback({ message: 'container `' + name + '` not found' }, null);
			return;
		}
				
		var parser = new xml2js.Parser();
        parser.addListener('end', function(result) {
			var containers = [];
			
			if (result.Containers.Container)
				containers = [result.Containers.Container].flatten().map(function(c){ return { name: c.Name, url: c.Url, lastModified: c.LastModified }; });

			callback(null, containers);
        });

		var result = parser.parseString(response.body);
	});
};

Service.prototype.listBlobs = function(containerName, callback){ 
	var options =  {restype: 'container', comp: 'list'};
	
	this.coreService.execute('get', containerName, options, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var parser = new xml2js.Parser();

        parser.addListener('end', function(result) {
			var blobs = [];

			if (result.Blobs.Blob)
				blobs = [result.Blobs.Blob].flatten().map(function(c){ return { name: c.Name, url: c.Url, contentType: c.Properties['Content-Type'] }; });

			callback(null, blobs);
        });

		var result = parser.parseString(response.body);
	});
};

Service.prototype.createContainer = function(name, callback){
	this.coreService.execute('put', name, {restype: 'container'}, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null;

		if (err != null && err.statusCode == 409) 
			error = { message: 'container `' + name + '` already exists' };
		else
			data = { name: name };

		callback(error, data);
	});
};

Service.prototype.deleteContainer = function(name, callback){
	this.coreService.execute('delete', name, {restype: 'container'}, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null;

		if (err != null && err.statusCode == 404)
			error = { message: 'container `' + name + '` not found' };
			
		callback(error);
	});
};

Service.prototype.getContainerProperties = function(name, callback){
	this.coreService.execute('get', name, {restype: 'container'}, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null
		
		if (err != null && err.statusCode == 404) 
			error = { message: 'container `' + name + '` not found' };
		else
			data = response.headers;
			
		callback(error, data);
	});	
};

Service.prototype.setContainerMetadata = function(name, metadata, callback){
	this.coreService.execute('put', name, {restype: 'container', comp: 'metadata'}, {'x-ms-version': '2009-09-19'}.merge(metadata || {}), null, function(err, response) {
		var error = null;

		if (err != null && err.statusCode == 400) 
			error = { message: 'container `' + name + '` not found' };
			
		callback(error);
	});	
};

Service.prototype.getContainerAcl = function(name, callback){
	this.coreService.execute('get', name, {restype: 'container', comp: 'acl'}, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null;

		if (err != null) 
			error = { message: err.statusCode };
		else
			if (response.headers && response.headers['x-ms-blob-public-access'])
				data = response.headers['x-ms-blob-public-access'];

		callback(error, data);
	});	
};

Service.prototype.setContainerAcl = function(name, level, callback){
	var headers = {'x-ms-version': '2009-09-19'}
 	if (level) headers.merge({'x-ms-blob-public-access': level});
	var payload = '<?xml version="1.0" encoding="utf-8"?><SignedIdentifiers />'
	
	this.coreService.execute('put', name, {restype: 'container', comp: 'acl'}, headers, payload, function(err, response) {
		var error = null;
			
		if (err != null) 
			error = { message: err.statusCode };

		callback(error);
	});	
};

Service.prototype.getBlobProperties = function(path, callback){
	this.coreService.execute('head', path, null, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null;
		
		if (err != null && err.statusCode == 400) 
			error = { message: 'blob `' + path + '` not found' };
		else
			data = response.headers;
		
		callback(error, data);	
	});
};

Service.prototype.getBlobMetadata = function(name, callback){
	this.coreService.execute('head', name, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null;

		if (err != null && err.statusCode == 400) 
			error = { message: 'blob `' + name + '` not found' };
		else
			data = response.headers;
		
		callback(error, data);	
	});
};

Service.prototype.setBlobProperties = function(path, properties, callback){
	this.coreService.execute('put', path, {comp: 'properties'}, {'x-ms-version': '2009-09-19'}.merge(properties || {}), null, function(err, response) {
		var error = null;

		if (err != null && err.statusCode == 400) 
			error = { message: 'blob `' + path + '` not found' };
			
		callback(error);
	});	
};

Service.prototype.setBlobMetadata = function(path, properties, callback){
	this.coreService.execute('put', path, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}.merge(properties || {}), null, function(err, response) {
		var error = null;

		if (err != null && err.statusCode == 400) 
			error = { message: 'blob `' + path + '` not found' };
			
		callback(error);
	});	
};

Service.prototype.putBlob = function(path, payload, contentType, metadata, callback){
	contentType = contentType || "application/octet-stream";
	headers = {'Content-Type': contentType, 'x-ms-blob-type': 'BlockBlob', 'x-ms-version': '2009-09-19', 'x-ms-blob-content-type': contentType}.merge(metadata);

	this.coreService.execute('put', path, null, headers, payload, function(err, response) {
		var error = null, data = null

		if (err != null && err.statusCode == 400) 
			error = { message: 'blob `' + name + '` not found' };
		else
			data = response.headers;
		
		callback(error, data);	
	});
};

Service.prototype.getBlob = function(path, callback){
	this.coreService.execute('get', path, null, {'x-ms-version': '2009-09-19'}, null, function(err, response) {
		var error = null, data = null

		if (err != null && err.statusCode == 404) 
			error = { message: 'blob `' + path + '` not found' };
		else
			data = response.body;
		
		callback(error, data);	
	});
};

Service.prototype.deleteBlob = function(path, callback){
	this.coreService.execute('delete', path, null, {'x-ms-version': '2009-09-19'}, null, function(err) {
		var error = null;
	
		if (err != null && err.statusCode == 404) 
			error = { message: 'blob `' + path + '` not found' };
		
		callback(error);	
	});
}

Service.prototype.generateRequestUri = function(path, options){
	return this.coreService.generateRequestUri(path, options);
};
