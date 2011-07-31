var waz = require('waz-storage')
		, assert = require('assert')
		, sinon = require('sinon')
		, Blob = require('../../lib/waz-blobs/blob');

module.exports = {

	'should return blob path from url': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob', contentType: 'application/xml'})
		assert.equal(blob.path, "container/blob");
	},
	
	'blob path should include snapshot parameter': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo', contentType: 'application/xml'})
		assert.equal(blob.path, "container/blob?snapshot=foo");
	},
	
	'blob path should not include additional parameters': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo&additional=true', contentType: 'application/xml'})
		assert.equal(blob.path, "container/blob?snapshot=foo");
	},
}