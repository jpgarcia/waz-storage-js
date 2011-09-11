var waz = require('waz-storage')
	, assert = require('assert')
	, sinon = require('sinon')
	, Service = require('waz-queues/service');
		
module.exports = {	
	
	'should list queues': function(){
		var mockResponse = '<?xml version="1.0" encoding="utf-8"?> \
		<EnumerationResults AccountName="http://myaccount.queue.core.windows.net"> \
		  <Prefix>q</Prefix> \
		  <MaxResults>3</MaxResults> \
		  <Queues> \
		    <Queue> \
		      <Name>q1</Name> \
		      <Url>http://myaccount.queue.core.windows.net/q1</Url> \
		      <Metadata> \
		        <Color>red</Color> \
		        <SomeMetadataName>SomeMetadataValue</SomeMetadataName> \
		      <Metadata> \
		    </Queue> \
		    <Queue> \
		      <Name>q2</Name> \
		      <Url>http://myaccount.queue.core.windows.net/q2</Url> \
		      <Metadata> \
		        <Color>blue</Color> \
		        <SomeMetadataName>SomeMetadataValue</SomeMetadataName> \
		      <Metadata> \
		    </Queue> \
		    <Queue> \
		      <Name>q3</Name> \
		      <Url>http://myaccount.queue.core.windows.net/q3</Url> \
		      <Metadata> \
		        <Color>yellow</Color> \
		        <SomeMetadataName>SomeMetadataValue</SomeMetadataName> \
		      <Metadata> \
		    </Queue> \
		  </Queues> \
		  <NextMarker>q4</NextMarker> \
		</EnumerationResults>';
				
		var mockData = { body: mockResponse, headers: {'x-ms-request-id': 'id', 'x-ms-version': '2009-09-19', 'Date': 'date' } , statusCode: 200};

		var service = new Service({});
		var mock = sinon.mock(service);	
		
		mock.expects("execute").withArgs('get', null, { comp: 'list', prefix: 'q' }, {'x-ms-version': '2009-09-19'}, null)
							   .yields({statusCode: 200, body: mockData})
							   .once();
							
		var options = { prefix: 'q' };
		
		service.list(options, function(err, data){
			assert.isNull(err);	
			assert.equal(data['@'].AccountName, 'http://myaccount.queue.core.windows.net');
			assert.equal(data.Prefix, 'q');
			assert.equal(data.Marker, undefined);
			assert.equal(data.NextMarker, 'q4');
						
			assert.equal(data.MaxResults, 3);
			assert.equal(data.Queues.Queue.length, 3);
			
			assert.equal(data.Queues.Queue[0].Name, 'q1');
			assert.equal(data.Queues.Queue[0].Url, 'http://myaccount.queue.core.windows.net/q1');
			assert.equal(data.Queues.Queue[0].Metadata.Color, 'red');
			assert.equal(data.Queues.Queue[0].Metadata.SomeMetadataName, 'SomeMetadataValue');
		});					
		
		mock.verify();		
	},
		
	'should return an error when list fails': function(){
		var service = new Service({});
		var mock = sinon.mock(service);
		
		mock.expects("execute").yields({statusCode: 400}).once();
		
		service.list(null, function(err, data){
			assert.equal(err.Code, 400)		
		});					
		
		mock.verify();		
	},	

	'should create a queue with given metadata': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('put', 'queue1', null, { 'x-ms-version': '2009-09-19', 'x-ms-meta-name': 'value' }, null)
							   .yields({statusCode: 201})
							   .once();

		service.create('queue1', {'x-ms-meta-name': 'value'}, function(err){
			assert.equal(err, null);		
		});					

		mock.verify();		
	},

	'should return an error when create fails': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 400}).once();

		service.create('queue1', null, function(err){
			assert.equal(err.Code, 400);		
		});					

		mock.verify();		
	},	

	'should delete a queue': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('delete', 'queue1', null, { 'x-ms-version': '2009-09-19' }, null)
							   .yields({statusCode: 204})
							   .once();

		service.delete('queue1', function(err){
			assert.equal(err, null);		
		});					

		mock.verify();		
	},

	'should return an error when delete fails': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.delete('queue1', function(err){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},
	
	'should get queue metadata': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('get', 'queue1', {comp: 'metadata'}, { 'x-ms-version': '2009-09-19' }, null)
							   .yields({statusCode: 200, headers: { 'x-ms-approximate-message-count': 10, 'x-ms-meta-name': 'value' }})
							   .once();

		service.getMetadata('queue1', function(err){
			assert.equal(err, null);		
		});					

		mock.verify();		
	},
	
	'should return an error when retrieving metadata': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.getMetadata('queue1', function(err){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},
	
	'should set queue metadata': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('put', 'queue1', {comp: 'metadata'}, { 'x-ms-version': '2009-09-19', 'x-ms-meta-name': 'value' }, null)
							   .yields({statusCode: 200, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.putMetadata('queue1', {'x-ms-meta-name': 'value'},function(err){
			assert.equal(err, null);		
		});					

		mock.verify();		
	},
	
	'should return an error when setting metadata': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.putMetadata('queue1', {'x-ms-meta-name': 'value'}, function(err){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},	
	
	'should add a new message on a queue': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		var expectedPayload = '<QueueMessage><MessageText>message-content</MessageText></QueueMessage>'

		mock.expects("execute").withArgs('put', 'queue1/messages', {messagettl: 10}, { 'x-ms-version': '2009-09-19', }, expectedPayload)
							   .yields({statusCode: 201, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.putMessage('queue1', 'message-content', 10, function(err){
			assert.equal(err, null);		
		});					

		mock.verify();		
	},	
	
	'should return an error when adding a new message': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 400}).once();

		service.putMessage('queue1', 'message-content', 10, function(err){
			assert.equal(err.Code, 400);		
		});					

		mock.verify();		
	},
}