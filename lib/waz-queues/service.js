var utils = require('../waz-storage/utils')
	, xml2js = require('xml2js')
	, _ = require('underscore')
	, CoreService = require('../waz-storage/core-service');

exports = module.exports = Service;

function Service(options) {
	this.options = options;
	this.init();
}

Service.prototype = new CoreService;

Service.prototype.list = function(options, callback){ 
	var options =  {comp: 'list'}.merge(options);
	var service = this;
	
	service.execute('get', null, options, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		new xml2js.Parser().on('end', function(result) {
			callback(null, result);
        }).parseString(response.body);
	});
};

Service.prototype.create = function(name, metadata, callback){ 
	var service = this;
	
	service.execute('put', name, null, {'x-ms-version': '2009-09-19'}.merge(metadata), null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null);
	});
};

Service.prototype.delete = function(name, callback){ 
	var service = this;
	
	service.execute('delete', name, null, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null);
	});
};

Service.prototype.getMetadata = function(name, callback){ 
	var service = this;

	service.execute('get', name, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null);
	});
};

Service.prototype.putMetadata = function(name, metadata, callback){ 
	var service = this;

	service.execute('put', name, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}.merge(metadata), null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null);
	});
};

Service.prototype.putMessage = function(name, message, messagettl, callback){ 
	var service = this;

	var payload = '<QueueMessage><MessageText>' + message + '</MessageText></QueueMessage>';
	
	service.execute('put', name + '/messages', {messagettl: messagettl}, {'x-ms-version': '2009-09-19'}, payload, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null);
	});
};