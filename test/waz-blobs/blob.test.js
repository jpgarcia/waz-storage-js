var waz = require('waz-storage')
		, assert = require('assert')
		, sinon = require('sinon')
		, Blob = require('../../lib/waz-blobs/blob')
		, Service = require('../../lib/waz-blobs/service');		

module.exports = {

	'should return blob path from url': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob', contentType: 'text/xml'})
		assert.equal(blob.path, "container/blob");
	},
	
	'blob path should include snapshot parameter': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo', contentType: 'text/xml'});
		assert.equal(blob.path, "container/blob?snapshot=foo");
	},
	
	'blob path should not include additional parameters': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo&additional=true', contentType: 'text/xml'})
		assert.equal(blob.path, "container/blob?snapshot=foo");
	},
	
	'should get blob contents': function(){
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/containerName/my%20Blob', contentType: 'text/xml', serviceInstance: blobService});

		mock.expects("getBlob").withArgs("containerName/my%20Blob")
							   .yields(null, '<xml>value</xml>')
							   .once();
							
		blob.getContents(function(err, data){
			assert.isNull(err);
			assert.equal(data, '<xml>value</xml>');						
		});
		
		mock.verify();		
	},
}