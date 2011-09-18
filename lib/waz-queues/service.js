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
			callback(null, result.merge(response.headers));
		}).on('error', function(e){
			// Don't know why but without adding this callback it throws an error
			// Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar
		}).parseString(response.body);
	});
};

Service.prototype.create = function(name, metadata, callback){ 
	var service = this;
	
	service.execute('put', name, null, {'x-ms-version': '2009-09-19'}.merge(metadata), null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.delete = function(name, callback){ 
	var service = this;
	
	service.execute('delete', name, null, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.getMetadata = function(name, callback){ 
	var service = this;

	service.execute('get', name, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.putMetadata = function(name, metadata, callback){ 
	var service = this;

	service.execute('put', name, {comp: 'metadata'}, {'x-ms-version': '2009-09-19'}.merge(metadata), null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.putMessage = function(name, message, options, callback){ 
	var service = this;

	var payload = '<QueueMessage><MessageText>' + message + '</MessageText></QueueMessage>';
	
	service.execute('put', name + '/messages', options, {'x-ms-version': '2009-09-19'}, payload, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

// It can be used to peek messages by providing the options peekonly=true and [numofmessages=32max]
Service.prototype.getMessages = function(name, options, callback) { 
	var service = this;
	
	service.execute('get', name + '/messages', options, {'x-ms-version': '2009-09-19'}, null, function(response) {
		if (service.parseError(response, callback))
			return;

		new xml2js.Parser({explicitRoot: true}).on('end', function(result) {			
			var data = { messages: [] };
			
			if (result.QueueMessagesList.QueueMessage)
				data.messages = [result.QueueMessagesList.QueueMessage].flatten();
			
			callback(null, data.merge(response.headers));
		}).on('error', function(e){
			// Don't know why but without adding this callback it throws an error
			// Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar
		}).parseString(response.body);
	});
};

Service.prototype.deleteMessage = function(name, messageId, popReceipt, callback){ 
	var service = this;
	
	service.execute('delete', name + '/messages/' + messageId, {popreceipt: popReceipt}, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.clearMessages = function(name, callback){ 
	var service = this;
	
	service.execute('delete', name + '/messages', null, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};

Service.prototype.updateMessage = function(name, messageId, popReceipt, visibilityTimeout, callback){ 
	var service = this;
	
	service.execute('put', name + '/messages/' + messageId, {popreceipt: popReceipt, visibilitytimeout: visibilityTimeout}, {'x-ms-version': '2009-09-19'}, null, function(response) {		
		if (service.parseError(response, callback))
			return;

		callback(null, response.headers);
	});
};
