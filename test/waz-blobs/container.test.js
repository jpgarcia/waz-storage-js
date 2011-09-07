var waz = require('waz-storage')
	, assert = require('assert')
	, sinon = require('sinon')
	, _s = require('underscore.string');

module.exports = {
		
	'should be able to create a container': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		var mockData = { name:"containerName" };
		
		mock.expects("createContainer").withArgs("myContainer").yields(null, mockData).once();
		
		waz.blobs.container.create('myContainer', function(err, container){
			assert.equal(container.name, "containerName");			
			assert.isNull(err);
		});
		
		mock.verify();		
	},

	'should be able to delete a container': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		mock.expects("deleteContainer").withArgs("existing").yields(null, null).once();

		waz.blobs.container.delete('existing', function(err){
			assert.isNull(err);
		});
		
		mock.verify();	
	},
		
	'should list containers': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		var mockData = [{ name:"container1", url:"url1", lastModified: 'today1'}, {name:"container2", url:"url2", lastModified: 'today2' }];
		
		mock.expects("listContainers").withArgs().yields(null, mockData).once();
		
		waz.blobs.container.list(function(err, containers){			
			assert.equal(containers.length, 2);
			assert.equal(containers[0].name, "container1");
			assert.equal(containers[0].url, "url1");
			assert.equal(containers[0].lastModified, "today1");
			
			assert.equal(containers[1].name, "container2");
			assert.equal(containers[1].url, "url2");
			assert.equal(containers[1].lastModified, "today2");			
			
			assert.isNull(err);
		});
		
		mock.verify();		
	},
	
	'should be able to return metadata from a given container': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		var mockData = { 'x-ms-Name' : "containerName", 'x-ms-CustomProperty' : "customPropertyValue" };
		
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).twice();
		
		waz.blobs.container.find('containerName', function (err, container) {
			container.metadata(function(err, metadata) {
				assert.equal(metadata['x-ms-Name'], "containerName");
				assert.equal(metadata['x-ms-CustomProperty'], "customPropertyValue");	
				assert.equal(Object.keys(metadata).length, 2)						
				assert.isNull(err);
			});
		});
		
		mock.verify();			
	},
	
	'should be able to add metadata to a container': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		var mockData = { 'x-meta-Name' : "containerName" };
		
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
				
		var metadata = { 'x-meta-CustomProperty' : "customPropertyValue" };
		mock.expects("setContainerMetadata").withArgs("containerName", metadata).yields(null).once();
		
		waz.blobs.container.find('containerName', function (err, container) {
			container.putMetadata(metadata, function(err) {
				assert.isNull(err);
			});
		});
		
		mock.verify();		
	},
	
	'should be able to return a container by name': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		var mockData = { xMsMetaName:"containerName" };
		
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();

		waz.blobs.container.find('containerName', function(err, container){
			assert.equal(container.name, "containerName");
			assert.isNull(err);
		});
		
		mock.verify();		
	},
	
	'should get None when ACL is null': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		
		mock.expects("getContainerAcl").withArgs("containerName").yields(null, null).once();
				
		waz.blobs.container.find('containerName', function (err, container) {
			container.getAcl(function(err, data){
				assert.equal(data, "None");
				assert.isNull(err);
			});
		});
		
		mock.verify();		
	},
	
	'should be able to get the ACL': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		var acl = 'container';
		mock.expects("getContainerAcl").withArgs("containerName").yields(null, acl).once();
				
		waz.blobs.container.find('containerName', function (err, container) {
			container.getAcl(function(err, data){
				assert.equal(data, "container");
				assert.isNull(err);
			});
		});	
		
		mock.verify();		
	},	
	
	'should set container ACL to blob': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		mock.expects("setContainerAcl").withArgs("containerName", "blob").yields(null).once();
				
		waz.blobs.container.find('containerName', function (err, container) {
			container.setAcl('blob', function(err, data){				
				assert.equal(data, container);
				assert.isNull(err);
			});
		});			
		
		mock.verify();		
	},
	
	'should list blobs in a container': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		
		var mockBlobs = [ { name: 'blob1', url: 'http://localhost/container/blob1', contentType: 'text/xml' },
						  { name: 'blob2', url: 'http://localhost/container/blob2', contentType: 'application/json' } ]
		
		mock.expects("listBlobs").withArgs("containerName").yields(null, mockBlobs).once();
				
		waz.blobs.container.find('containerName', function (err, container) {
			container.blobs(function(err, data){
				assert.equal(data.length, 2);
				assert.equal(data[0].name, 'blob1');
				assert.equal(data[0].url, 'http://localhost/container/blob1');
				assert.equal(data[0].contentType, 'text/xml');

				assert.equal(data[1].name, 'blob2');
				assert.equal(data[1].url, 'http://localhost/container/blob2');
				assert.equal(data[1].contentType, 'application/json');
								
				assert.isNull(err);
			});
		});	
		
		mock.verify();				
	},
	
	'should return an empty array if container doesn\'t have blobs': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		
		var mockBlobs = []
		
		mock.expects("listBlobs").withArgs("containerName").yields(null, mockBlobs).once();
				
		waz.blobs.container.find('containerName', function (err, container) {
			container.blobs(function(err, data){
				assert.equal(data.length, 0);
				assert.isNull(err);
			});
		});		
		
		mock.verify();			
	},	
	
	'should return a blob instance by a given name': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		
		var mockBlob = {'content-type': 'text/xml'}		
		mock.expects("getBlobProperties").withArgs("containerName/myBlob").yields(null, mockBlob).once();

		var mockUrl = 'http://mock-account.blob.core.windows.net/containerName/myBlob';
		mock.expects("generateRequestUri").withArgs("containerName/myBlob", {}).returns(mockUrl).once();
		
		waz.blobs.container.find('containerName', function (err, container) {
			container.getBlob('myBlob', function(err, blob){	
				assert.equal(blob.name, 'myBlob');
				assert.equal(blob.contentType, 'text/xml');
				assert.equal(blob.url, 'http://mock-account.blob.core.windows.net/containerName/myBlob');								
				assert.isNull(err);
			});
		});			

		mock.verify();
	},
	
	'should return a blob instance by a given un-escaped name': function(){		
		waz.establishConnection({ accountName : 'name', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };
		mock.expects("getContainerProperties").withArgs("containerName").yields(null, mockData).once();
		
		var mockBlob = {'content-type': 'text/xml'}		
		mock.expects("getBlobProperties").withArgs("containerName/my%20Blob").yields(null, mockBlob).once();

		var mockUrl = 'http://mock-account.blob.core.windows.net/containerName/my%20Blob';
		mock.expects("generateRequestUri").withArgs("containerName/my%20Blob", {}).returns(mockUrl).once();
		
		waz.blobs.container.find('containerName', function (err, container) {
			container.getBlob('my Blob', function(err, blob){
				assert.equal(blob.name, 'my Blob');
				assert.equal(blob.contentType, 'text/xml');
				assert.equal(blob.url, 'http://mock-account.blob.core.windows.net/containerName/my%20Blob');								
				assert.isNull(err);
			});
		});			
		
		mock.verify();
	},
	
	'should store a blob': function(){		
		waz.establishConnection({ accountName : 'mock-account', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };

		mock.expects("putBlob").withArgs("containerName/my%20Blob", '<xml><sample>value</sample></xml>', 'text/xml', {'x-ms-test': 'value'})
							   .yields(null, null)
							   .once();

		mock.expects("generateRequestUri").withArgs("containerName/my%20Blob")
							   .returns('http://foo')
							   .once();
							
		var Container = require('waz-blobs/container');		

		var options = { name: 'containerName', 
						url: 'http://bar', 
						serviceInstance: waz.blobs.container.serviceInstance, 
						lastModified: 'mockDate' }

		var container = new Container(options);

		container.store('my Blob', '<xml><sample>value</sample></xml>', 'text/xml', {'x-ms-test': 'value'}, function(err, blob){
			assert.equal(blob.name, 'my Blob');
			assert.equal(blob.contentType, 'text/xml');
			assert.equal(blob.url, 'http://foo');
			assert.isNull(err);
		});
		
		mock.verify();	
	},	

	'should store a blob with default content-type': function(){		
		waz.establishConnection({ accountName : 'mock-account', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);

		var mockData = { 'x-meta-Name' : "containerName" };

		mock.expects("putBlob").withArgs("containerName/my%20Blob", '<xml><sample>value</sample></xml>', "application/octet-stream", {'x-ms-test': 'value'})
							   .yields(null, null)
							   .once();			

		var Container = require('waz-blobs/container');		

		var options = { name: 'containerName', 
						url: 'http://bar', 
						serviceInstance: waz.blobs.container.serviceInstance, 
						lastModified: 'mockDate' }

		var container = new Container(options);

		container.store('my Blob', '<xml><sample>value</sample></xml>', null, {'x-ms-test': 'value'}, function(err, blob){
			assert.equal(blob.name, 'my Blob');
			assert.equal(blob.contentType, 'application/octet-stream');
			assert.equal(blob.url, 'http://mock-account.blob.core.windows.net/containerName/my%20Blob');
			assert.isNull(err);
		});

		mock.verify();	
	},
	
	'should upload a stream to a blob': function() {
		waz.establishConnection({ accountName : 'mock-account', accountKey : 'key' });

		var mock = sinon.mock(waz.blobs.container.serviceInstance);
		
		var Container = require('waz-blobs/container');		
		var options = { name: 'containerName', 
						url: 'http://bar', 
						serviceInstance: waz.blobs.container.serviceInstance, 
						lastModified: 'mockDate' }

		var container = new Container(options);
		
		var fs = require('fs');
		
		var stream = fs.createReadStream('./test/mock-files/sample.txt', { 'flags': 'r' , 'encoding': 'utf-8', 'bufferSize': 9});
		
		var identifier0 =  new Buffer(_s.pad(0, 64, '0')).toString('base64');
		var identifier1 =  new Buffer(_s.pad(1, 64, '0')).toString('base64');		
		
		mock.expects("putBlock").withArgs("containerName/my%20Blob", identifier0, '123456789')
							    .yields(null)
							    .once();
							
		mock.expects("putBlock").withArgs("containerName/my%20Blob", identifier1, '0')
							    .yields(null)
							    .once();
							
		mock.expects("putBlockList").withArgs("containerName/my%20Blob", [identifier0, identifier1], "plain/text", {'x-ms-test': 'value'})
							    	.yields(null, {'x-ms-request-id': 'id'})
							    	.once();

		var uploader = container.upload('my Blob', stream, "plain/text", {'x-ms-test': 'value'}, function(err, block) {
			
			//block uploaded
			assert.isDefined(block.identifier);
			assert.isNotNull(block.identifier);
			
			assert.isDefined(block.number);
			assert.isNotNull(block.number);
		}, function(err, blob){
			
			//block list submitted
			assert.equal(blob.name, 'my Blob');
			assert.equal(blob.contentType, 'plain/text');
			assert.equal(blob.url, 'http://mock-account.blob.core.windows.net/containerName/my%20Blob');
		});		
	},
}