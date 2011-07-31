var waz = require('waz-storage')
	, assert = require('assert');

module.exports = {
	
	'should return a valid version': function(){
		assert.match(waz.version, /^\d+\.\d+\.\d+$/);
	},	
	
	'should set connection properties': function(){
		var storage = waz.establishConnection( { accountName : 'name', accountKey : 'key', useSsl : true } );
		assert.equal(storage.defaultConnection.accountName, 'name');
		assert.equal(storage.defaultConnection.accountKey, 'key');
		assert.equal(storage.defaultConnection.useSsl, true);
	},
	
	'should set useSsl as false by default if not provided': function(){
		var storage = waz.establishConnection( { accountName : 'name', accountKey : 'key' } );
		assert.equal(storage.defaultConnection.accountName, 'name');
		assert.equal(storage.defaultConnection.accountKey, 'key');
		assert.equal(storage.defaultConnection.useSsl, false);
	},
		
	'should throw when accountName is not provided': function(){
		try {
			var storage = waz.establishConnection({ accountKey : 'key', useSsl : true });
		}
		catch(e) {		
			assert.equal(e.message, 'accountName required');	
		}
	},
	
	'should throw when accountKey is not provided': function(){
		try {
			var storage = waz.establishConnection({accountName : 'name', useSsl : true});
		}
		catch(e) {		
			assert.equal(e.message, 'accountKey required');	
		}
	}
};