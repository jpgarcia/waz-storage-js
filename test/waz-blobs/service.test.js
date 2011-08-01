var waz = require('waz-storage')
		, assert = require('assert')
		, sinon = require('sinon')
		, Service = require('../../lib/waz-blobs/service');
		
module.exports = {	
	
	'should create a new container': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		
		var mockData = { body:'', headers: {'x-ms-meta-Name': 'newContainer'} };
		
		mock.expects("execute").withArgs('put', 'newContainer', { restype: 'container' }, {'x-ms-version': '2009-09-19'}, null)
							   .yields(null, mockData)
							   .once();
				
		blobService.createContainer('newContainer', function(err, data){	
			assert.equal(data.name, "newContainer");
			assert.isNull(err);
		});					
		
		mock.verify();		
	},	
	
	'should delete container': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		
		var mockData = { body: '', headers: {'x-ms-meta-Name': 'newContainer'}, statusCode: 202 };
		
		mock.expects("execute").withArgs('delete', 'existing', { restype: 'container' }, {'x-ms-version': '2009-09-19'}, null)
							   .yields(null, mockData)
							   .once();
				
		blobService.deleteContainer('existing', function(err, data){
			assert.isNull(err);
			assert.isNull(data);			
		});
		
		mock.verify();
	},
	
	'should throw when unexisting container is provided for deletion': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		
		
		mock.expects("execute").withArgs('delete', 'unexisting', { restype: 'container' }, {'x-ms-version': '2009-09-19'}, null)
							   .yields({ statusCode: 404 }, null)
							   .once();
				
		blobService.deleteContainer('unexisting', function(err, data){
			assert.equal(err.message, 'container `unexisting` not found');
			assert.isNull(data);			
		});

		mock.verify();
	},
			
	'should report an error when creating a container that already exists': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);	
		mock.expects("execute").withArgs('put', 'existing', { restype: 'container' }, {'x-ms-version': '2009-09-19'}, null)
								.yields({ statusCode: 409 }, null)
								.once();
				
		blobService.createContainer('existing', function(err, data){
			assert.equal(err.message, 'container `existing` already exists');
			assert.isNull(data);			
		});
		
		mock.verify();
	},
	
	'should get container properties': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};

		mock.expects("execute").withArgs('get', 'mock-container', { restype: 'container' }, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.getContainerProperties('mock-container', function(err, properties){
			assert.isNull(err);			
		});
		
		mock.verify();
	},

	'should get blob properties': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: { 'Content-Type': 'text/xml' } };

		mock.expects("execute").withArgs('head', 'mock-container/blob', null, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.getBlobProperties('mock-container/blob', function(err, properties){
			assert.equal(properties['Content-Type'], 'text/xml');
			assert.isNull(err);			
		});
		
		mock.verify();
	},

	'should set container properties': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};

		mock.expects("execute").withArgs('put', 'mock-container', { restype: 'container', comp: 'metadata' }, {'x-ms-version': '2009-09-19', 'x-ms-CustomProp': 'value'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.setContainerProperties('mock-container', {'x-ms-CustomProp': 'value'}, function(err, properties){
			mock.verify();
			assert.isNull(err);			
		});
	},
	
	'should get null when container ACL is not set': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};

		mock.expects("execute").withArgs('get', 'mock-container', { restype: 'container', comp: 'acl' }, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.getContainerAcl('mock-container', function(err, data){
			assert.isNull(err);
			assert.equal(data, null)
		});
		
		mock.verify();		
	},
	
	'should get Container ACL when is set': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: {'x-ms-blob-public-access': 'blob'}};

		mock.expects("execute").withArgs('get', 'mock-container', { restype: 'container', comp: 'acl' }, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.getContainerAcl('mock-container', function(err, data){
			assert.isNull(err);
			assert.equal(data, 'blob')
		});
		
		mock.verify();		
	},
		
	'should throw when error when retrieving container ACL': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		

		mock.expects("execute").withArgs('get', 'unexisting', { restype: 'container', comp: 'acl'  }, {'x-ms-version': '2009-09-19'}, null)
							   .yields({ statusCode: 400 }, null)
							   .once();

		blobService.getContainerAcl('unexisting', function(err, data){	
			assert.equal(err.message, '400');
			assert.isNull(data);			
		});	
		
		mock.verify();			
	},
	
	'should set container acl': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};
		var payload = '<?xml version="1.0" encoding="utf-8"?><SignedIdentifiers />';
		
		mock.expects("execute").withArgs('put', 'mock-container', { restype: 'container', comp: 'acl' }, {'x-ms-version': '2009-09-19', 'x-ms-blob-public-access': 'blob'}, payload)
								.yields(null, mockData)
								.once();

		var properties = blobService.setContainerAcl('mock-container', 'blob', function(err, properties){
			assert.isNull(err);
		});
		
		mock.verify();		
	},
	
	'should set container acl to none': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: {}};
		var payload = '<?xml version="1.0" encoding="utf-8"?><SignedIdentifiers />';

		mock.expects("execute").withArgs('put', 'mock-container', { restype: 'container', comp: 'acl' }, {'x-ms-version': '2009-09-19'}, payload)
								.yields(null, mockData)
								.once();

		var properties = blobService.setContainerAcl('mock-container', null, function(err, properties){
			assert.isNull(err);			
		});
		
		mock.verify();		
	},
	
	'should return null when there are no containers': function(){

		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		

		var mockBody = '<?xml version="1.0" encoding="utf-8"?><EnumerationResults AccountName="http://jpg.blob.core.windows.net/"><Containers /><NextMarker /></EnumerationResults>';
		var mockData = { body: mockBody, headers: null };

		mock.expects("execute").withArgs('get', null, {comp: 'list'}, null, null)
								.yields(null, mockData)
								.once();

        blobService.listContainers({}, function(err, containers){
			assert.equal(containers.length, 0);
			assert.isNull(err);
		});
		
		mock.verify();	
	},
	
	'should list only one container': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		

		var mockBody = '<?xml version="1.0" encoding="utf-8"?> \
            <EnumerationResults AccountName="http://myaccount.blob.core.windows.net"> \
              <Containers> \
                <Container> \
                  <Name>container1</Name> \
                  <Url>http://localhost/container1</Url> \
                  <LastModified>2009-09-11</LastModified> \
                </Container> \
			 </Containers> \
            </EnumerationResults>';

		var mockData = { body: mockBody, headers: null };

		mock.expects("execute").withArgs('get', null, {comp: 'list'}, null, null)
								.yields(null, mockData)
								.once();

        blobService.listContainers({}, function(err, containers){
			assert.equal(containers.length, 1);
			assert.equal(containers[0].name, "container1");
			assert.equal(containers[0].url, "http://localhost/container1");
			assert.equal(containers[0].lastModified, "2009-09-11");			
			assert.isNull(err);
		});
		
		mock.verify();		
	},
	
	'should list more than one container': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
	
		var mockBody = '<?xml version="1.0" encoding="utf-8"?> \
            <EnumerationResults AccountName="http://myaccount.blob.core.windows.net"> \
              <Containers> \
                <Container> \
                  <Name>container1</Name> \
                  <Url>http://localhost/container1</Url> \
                  <LastModified>2009-09-11</LastModified> \
                </Container> \
                <Container> \
                  <Name>container2</Name> \
                  <Url>http://localhost/container2</Url> \
                  <LastModified>2009-09-12</LastModified> \
                </Container> \
			 </Containers> \
            </EnumerationResults>';

		var mockData = { body: mockBody, headers: null };	
		mock.expects("execute").withArgs('get', null, {comp: 'list'}, null, null)
								.yields(null, mockData)
								.once();

        blobService.listContainers({}, function(err, containers){
			assert.equal(containers.length, 2);
			assert.equal(containers[0].name, "container1");	
			assert.equal(containers[0].url, "http://localhost/container1");
			assert.equal(containers[0].lastModified, "2009-09-11");

			assert.equal(containers[1].name, "container2");
			assert.equal(containers[1].url, "http://localhost/container2");
			assert.equal(containers[1].lastModified, "2009-09-12");
			assert.isNull(err);
		});
		
		mock.verify();		
	},
	
	'should list blobs' : function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		
		var mockBody = '<?xml version="1.0" encoding="utf-8"?> \
	                <EnumerationResults AccountName="http://myaccount.blob.core.windows.net"> \
	                 <Blobs> \
	                     <Blob> \
	                       <Url>http://localhost/container/blob</Url> \
	                       <Name>blob</Name> \
	                       <Properties> \
	                          <Content-Type>text/xml</Content-Type> \
	                       </Properties> \
	                       <Metadata> \
	                           <Name>value</Name> \
	                       </Metadata> \
	                     </Blob> \
	                     <Blob> \
	                       <Url>http://localhost/container/blob2</Url> \
	                       <Name>blob2</Name> \
	                       <Properties> \
	                          <Content-Type>application/x-stream</Content-Type> \
	                       </Properties> \
	                       <Metadata> \
	                           <Name>value</Name> \
	                       </Metadata> \
	                     </Blob> \
	                   </Blobs> \
	                </EnumerationResults>';
	
		var mockData = { body: mockBody, headers: null };	
		mock.expects("execute").withArgs('get', 'myContainer', {restype: 'container', comp: 'list'}, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

        blobService.listBlobs('myContainer', function(err, blobs){	
			assert.equal(blobs.length, 2);
			assert.equal(blobs[0].name, "blob");	
			assert.equal(blobs[0].url, "http://localhost/container/blob");
			assert.equal(blobs[0].contentType, "text/xml");

			assert.equal(blobs[1].name, "blob2");
			assert.equal(blobs[1].url, "http://localhost/container/blob2");
			assert.equal(blobs[1].contentType, "application/x-stream");
			assert.isNull(err);
		});
		
		mock.verify();
	},
		
	'should return [] if any blobs found' : function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);		
		var mockBody = '<?xml version="1.0" encoding="utf-8"?> \
							<EnumerationResults ContainerName="http://jpg.blob.core.windows.net/test1"> \
								<MaxResults>1000</MaxResults> \
								<Delimiter>/</Delimiter> \
								<Blobs /> \
								<NextMarker /> \
							</EnumerationResults>';
	
		var mockData = { body: mockBody, headers: null };	
		mock.expects("execute").withArgs('get', 'myContainer', {restype: 'container', comp: 'list'}, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

        blobService.listBlobs('myContainer', function(err, blobs){	
			assert.equal(blobs.length, 0);
			assert.isNull(err);
		});
		
		mock.verify();
	},
		
	'should store a blob': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};
		var expectedHeaders = {'Content-Type': 'text/xml', 'x-ms-blob-type': 'BlockBlob', 'x-ms-version': '2009-09-19', 'x-ms-blob-content-type': 'text/xml' , 'x-ms-CustomProp': 'value'};

		mock.expects("execute").withArgs('put', 'mock-container/blob', null, expectedHeaders, 'payload')
								.yields(null, mockData)
								.once();

		var properties = blobService.putBlob('mock-container/blob', 'payload', 'text/xml', {'x-ms-CustomProp': 'value'}, function(err, properties){
			assert.isNull(err);			
		});

		mock.verify();	
	},

	'should get blob contents': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '<xml></xml>', headers: null};

		mock.expects("execute").withArgs('get', 'mock-container/blob', null, {'x-ms-version': '2009-09-19'}, null)
								.yields(null, mockData)
								.once();

		var properties = blobService.getBlob('mock-container/blob', function(err, data){
			assert.isNull(err);
			assert.equal(data, mockData.body);
		});

		mock.verify();		
	},
		
	'should store a blob if metadata if not specified': function(){
		var blobService = new Service({});
		var mock = sinon.mock(blobService.coreService);
		var mockData = {body: '', headers: null};
		var expectedHeaders = {'Content-Type': 'text/xml', 'x-ms-blob-type': 'BlockBlob', 'x-ms-version': '2009-09-19','x-ms-blob-content-type': 'text/xml'};

		mock.expects("execute").withArgs('put', 'mock-container/blob', null, expectedHeaders, 'payload')
								.yields(null, mockData)
								.once();

		var properties = blobService.putBlob('mock-container/blob', 'payload', 'text/xml', null, function(err, data){
			assert.isNull(err);			
		});

		mock.verify();		
	},
}