var waz = require('waz-storage')
	, assert = require('assert')
	, sinon = require('sinon')
	, Blob = require('waz-blobs/blob')
	, Service = require('waz-blobs/service');		

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
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/my%20Blob', contentType: 'text/xml', serviceInstance: blobService});

		mock.expects("getBlob").withArgs("containerName/my%20Blob")
							   .yields(null, '<xml>value</xml>')
							   .once();
							
		blob.getContents(function(err, data){
			assert.isNull(err);
			assert.equal(data, '<xml>value</xml>');						
		});
		
		mock.verify();		
	},	
	
	'should be able to return properties from a given blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		var mockData = { 'x-ms-meta-name' : "blobName", 'x-ms-blob-custom' : "value" };		
		mock.expects("getBlobProperties").withArgs("containerName/blobName").yields(null, mockData).once();
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.properties(function(err, properties){
			assert.equal(Object.keys(properties).length, 2);
			assert.equal(properties['x-ms-meta-name'], "blobName");
			assert.equal(properties['x-ms-blob-custom'], "value");
		});
		
		mock.verify();			
	},
		
	'should be able to return metadata from a given blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		var mockData = { 'x-ms-meta-name' : "blobName", 'x-ms-meta-custom' : "value" };		
		mock.expects("getBlobMetadata").withArgs("containerName/blobName").yields(null, mockData).once();
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.metadata(function(err, metadata){
			assert.equal(Object.keys(metadata).length, 2);
			assert.equal(metadata['x-ms-meta-name'], "blobName");
			assert.equal(metadata['x-ms-meta-custom'], "value");
		});
		
		mock.verify();			
	},
	
	'should be able to add properties to a blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		var mockData = { 'x-ms-CustomProperty' : "customPropertyValue" };		
		mock.expects("setBlobProperties").withArgs("containerName/blobName").yields(null, mockData).once();
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.putProperties(mockData, function(err){
			assert.isNull(err)
		});
		
		mock.verify();			
	},
	
	'should be able to add metadata to a blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		var mockData = { 'x-ms-meta-custom' : "value" };		
		mock.expects("setBlobMetadata").withArgs("containerName/blobName").yields(null, mockData).once();
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.putMetadata(mockData, function(err){
			assert.isNull(err)
		});
		
		mock.verify();			
	},
}