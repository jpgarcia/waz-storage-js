var CoreService = require('waz-storage/core-service')
	, assert = require('assert')
	, sinon = require('sinon');

module.exports = {
	
	'should generate URI with given operation': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };
    	
		var service = new CoreService(options);
		assert.equal(service.generateRequestUri(null, { comp: 'list'}), "https://mock-account.queue.localhost/?comp=list");
	},
	
	'should generate an URI without operation when operation is not given': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };
    	
		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("queue"), "https://mock-account.queue.localhost/queue");
	},
	
	'should generate a safe URI when path includes forward slash': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };
    	
		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("/queue"), "https://mock-account.queue.localhost/queue");
	},
	
	'should include additional parameters when given': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };
    	
		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("/queue", { comp: 'list', prefix: 'p'}), "https://mock-account.queue.localhost/queue?comp=list&prefix=p");
	},

	'should include additional parameters when given althought when there is no comp': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("/queue", { prefix: 'p', other: 'other'}), "https://mock-account.queue.localhost/queue?other=other&prefix=p");
	},	
	
	'should include additional parameters when given number parameters': function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("/queue", { comp: 'metadata', messagettl: 650}), "https://mock-account.queue.localhost/queue?comp=metadata&messagettl=650");
	},
	
	'should escape parameter values' : function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.generateRequestUri("/queue", { item: '%' }), "https://mock-account.queue.localhost/queue?item=%25");
	},
	
	'should canonicalize headers (order lexicographical, trim values, and join by NEW_LINES)' : function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		headers = { "Content-Type" : "application/xml",
	                "x-ms-prop-z": "p",
	                "x-ms-meta-name" : "a ",
	                "x-other" : "other"}
		assert.equal(service.canonicalizeHeaders(headers), "x-ms-meta-name:a\nx-ms-prop-z:p");
	},
	
	'should return empty string when no MS headers' : function(){		
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		headers = { "Content-Type" : "application/xml",
	                "x-other" : "other"}
		assert.equal(service.canonicalizeHeaders(headers), "");
	},
	
	'should cannonicalize message by appending account_name to the request path' : function(){
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.canonicalizeMessage("http://localhost/queue?comp=list"), "/mock-account/queue?comp=list");
	},
	
	'should ignore every other querystring parameter rather than comp=' : function(){
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.canonicalizeMessage("http://localhost/queue?myparam=1"), "/mock-account/queue");		
	},
	
	'should properly canonicalize message when no parameter associated with it' : function(){
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.canonicalizeMessage("http://mock-account.queue.core.windows.net/"), "/mock-account/");		
	}	,

	'should properly canonicalize message when a parameter is associated with it' : function(){
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "queue", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.canonicalizeMessage("http://mock-account.queue.core.windows.net/resource?comp=list"), "/mock-account/resource?comp=list");		
	},
	
	'should cannonicalize message by appending account_name to the request path following 2009-09-19 version of the API' : function(){
		var options = { accountName: "mock-account", accountKey: "mock-key", useSsl: true,
						typeOfService: "blob", baseUrl: "localhost" };

		var service = new CoreService(options);
		assert.equal(service.canonicalizeMessage20090919("http://mock-account.blob.core.windows.net/mycontainer?restype=container&comp=metadata"), "/mock-account/mycontainer\ncomp:metadata\nrestype:container");		
	}
}