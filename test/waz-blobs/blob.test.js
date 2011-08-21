var waz = require('waz-storage')
	, assert = require('assert')
	, sinon = require('sinon')
	, Blob = require('waz-blobs/blob')
	, Service = require('waz-blobs/service');		

module.exports = {

	'should return blob path from url': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob', contentType: 'text/xml'});
		assert.equal(blob.path, "container/blob");
	},
	
	'blob path should include snapshot parameter': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo', contentType: 'text/xml'});
		assert.equal(blob.path, "container/blob?snapshot=foo");
	},
	
	'blob path should not include additional parameters': function(){	
		var blob = new Blob({name: 'blob_name', url: 'http://localhost/container/blob?snapshot=foo&additional=true', contentType: 'text/xml'});
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
	
	'should delete a blob': function(){
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });
		var blobService = new Service({});
		var mock = sinon.mock(blobService);
		
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/my%20Blob', contentType: 'text/xml', serviceInstance: blobService});

		mock.expects("deleteBlob").withArgs("containerName/my%20Blob")
							   	  .yields(null)
							      .once();

		blob.destroy(function(err){
			assert.isNull(err);
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
			assert.isNull(err);
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
			assert.isNull(err);
		});
		
		mock.verify();			
	},
	
	'should copy a blob and return the copied instance': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
				
		mock.expects("copyBlob").withArgs("containerName/blobName", "containerName/newName").yields(null).once();
		mock.expects("getBlobProperties").withArgs("containerName/newName").yields(null, {'Content-Type': 'text/xml'}).once();		
		mock.expects("generateRequestUri").withArgs("containerName/newName").returns('http://localhost/containerName/newName').once();		
						
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.copy('containerName/newName', function(err, blob){
			assert.equal(blob.path, 'containerName/newName');
			assert.equal(blob.contentType, 'text/xml');
		});
		
		mock.verify();			
	},
	
	'should throw an error when trying to update a snapshot blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
										
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', contentType: 'text/xml', serviceInstance: blobService, snapshotDate: 'mock-date'});
		
		blob.updateContents('new-content', function(err){
			assert.equal(err, 'Invalid operation: Cannot modify snapshot contents.');
		});
		
		mock.verify();			
	},
	
	'should update blob contents with current blob contentType/metadata': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		mock.expects("putBlob").withArgs("containerName/blobName", "new-content", 'text/xml', null).yields(null, {'x-ms-request-id' : 'mock-request-id'}).once();
										
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', path: 'containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		
		blob.updateContents('new-content', function(err, blob){	
			assert.equal(blob.requestId, 'mock-request-id');
			assert.isNull(err);
		});
		
		mock.verify();			
	},
	
	'should update blob contents and its contentType and metadata ': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });		
		var blobService = new Service({});		
		var mock = sinon.mock(blobService);
		
		mock.expects("putBlob").withArgs("containerName/blobName", "new-content", 'newContentType', {'x-ms-sample-meta': 'metadata'}).yields(null, {'x-ms-request-id' : 'mock-request-id'}).once();
										
		var blob = new Blob({name: 'blobName', url: 'http://localhost/containerName/blobName', path: 'containerName/blobName', contentType: 'text/xml', serviceInstance: blobService});
		blob.metadataValue = {'x-ms-sample-meta': 'metadata'};
		blob.contentType = 'newContentType'
		
		blob.updateContents('new-content', function(err, blob){	
			assert.equal(blob.requestId, 'mock-request-id');
			assert.equal(blob.metadataValue['x-ms-sample-meta'], 'metadata');
			assert.equal(blob.contentType, 'newContentType');
			assert.isNull(err);
		});
		
		mock.verify();			
	},

}