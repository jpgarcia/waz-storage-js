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
		      </Metadata> \
		    </Queue> \
		    <Queue> \
		      <Name>q2</Name> \
		      <Url>http://myaccount.queue.core.windows.net/q2</Url> \
		      <Metadata> \
		        <Color>blue</Color> \
		        <SomeMetadataName>SomeMetadataValue</SomeMetadataName> \
		      </Metadata> \
		    </Queue> \
		    <Queue> \
		      <Name>q3</Name> \
		      <Url>http://myaccount.queue.core.windows.net/q3</Url> \
		      <Metadata> \
		        <Color>yellow</Color> \
		        <SomeMetadataName>SomeMetadataValue</SomeMetadataName> \
		      </Metadata> \
		    </Queue> \
		  </Queues> \
		  <NextMarker>q4</NextMarker> \
		</EnumerationResults>';
				
		var mockData = { body: mockResponse, headers: {'x-ms-request-id': 'id', 'x-ms-version': '2009-09-19', 'Date': 'date' }, statusCode: 200 };

		var service = new Service({});
		var mock = sinon.mock(service);	
		
		mock.expects("execute").withArgs('get', null, { comp: 'list', prefix: 'q' }, {'x-ms-version': '2009-09-19'}, null)
							   .yields(mockData)
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
							   .yields({statusCode: 201, headers: {'x-ms-request-id': 'id'}})
							   .once();

		service.create('queue1', {'x-ms-meta-name': 'value'}, function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');				
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
							   .yields({statusCode: 204, headers: {'x-ms-request-id': 'id'}})
							   .once();

		service.delete('queue1', function(err, data){
			assert.equal(err, null);		
			assert.equal(data['x-ms-request-id'], 'id');			
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

		service.getMetadata('queue1', function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-meta-name'], 'value');
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

		service.putMetadata('queue1', {'x-ms-meta-name': 'value'},function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');
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
		
		var options = {messagettl: 10};
		
		mock.expects("execute").withArgs('put', 'queue1/messages', options, { 'x-ms-version': '2009-09-19', }, expectedPayload)
							   .yields({statusCode: 201, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.putMessage('queue1', 'message-content', options, function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');				
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
	
	'should get messages from a queue': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		var mockResponseBody = '<QueueMessagesList> \
		    <QueueMessage> \
			    <MessageId>5974b586-0df3-4e2d-ad0c-18e3892bfca2</MessageId> \
			    <InsertionTime>Fri, 09 Oct 2009 21:04:30 GMT</InsertionTime> \
			    <ExpirationTime>Fri, 16 Oct 2009 21:04:30 GMT</ExpirationTime> \
			    <PopReceipt>YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw</PopReceipt> \
			    <TimeNextVisible>Fri, 09 Oct 2009 23:29:20 GMT</TimeNextVisible> \
			    <DequeueCount>1</DequeueCount> \
			    <MessageText>PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=</MessageText> \
		    </QueueMessage> \
		</QueueMessagesList>'
		
		var options = { numberofmessages: 10, visibilitytimeout: 60 };
		
		mock.expects("execute").withArgs('get', 'queue1/messages', options, { 'x-ms-version': '2009-09-19', }, null)
							   .yields({statusCode: 201, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}, body: mockResponseBody})
							   .once();
						
		service.getMessages('queue1', options, function(err, data){
			assert.equal(err, null);
			
			assert.equal(data['x-ms-version'], '2009-09-19');
			assert.equal(data['x-ms-request-id'], 'id');
			
			assert.equal(data.messages.length, 1);			
			assert.equal(data.messages[0]['MessageId'], '5974b586-0df3-4e2d-ad0c-18e3892bfca2');
			assert.equal(data.messages[0]['InsertionTime'], 'Fri, 09 Oct 2009 21:04:30 GMT');
			assert.equal(data.messages[0]['ExpirationTime'], 'Fri, 16 Oct 2009 21:04:30 GMT');
			assert.equal(data.messages[0]['PopReceipt'], 'YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw');
			assert.equal(data.messages[0]['TimeNextVisible'], 'Fri, 09 Oct 2009 23:29:20 GMT');
			assert.equal(data.messages[0]['DequeueCount'], 1);
			assert.equal(data.messages[0]['MessageText'], 'PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=');
		});					

		mock.verify();		
	},
	
	'should get messages from a queue when there are more than one message': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		var mockResponseBody = '<QueueMessagesList> \
		    <QueueMessage> \
		    <MessageId>5974b586-0df3-4e2d-ad0c-18e3892bfca2</MessageId> \
		    <InsertionTime>Fri, 09 Oct 2009 21:04:30 GMT</InsertionTime> \
		    <ExpirationTime>Fri, 16 Oct 2009 21:04:30 GMT</ExpirationTime> \
		    <PopReceipt>YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw</PopReceipt> \
		    <TimeNextVisible>Fri, 09 Oct 2009 23:29:20 GMT</TimeNextVisible> \
		    <DequeueCount>1</DequeueCount> \
		    <MessageText>PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=</MessageText> \
		    </QueueMessage> \
		    <QueueMessage> \
		    <MessageId>5974b586-0df3-4e2d-ad0c-18e3892bfca22</MessageId> \
		    <InsertionTime>Fri, 09 Oct 2009 21:04:30 GMT2</InsertionTime> \
		    <ExpirationTime>Fri, 16 Oct 2009 21:04:30 GMT2</ExpirationTime> \
		    <PopReceipt>YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw2</PopReceipt> \
		    <TimeNextVisible>Fri, 09 Oct 2009 23:29:20 GMT2</TimeNextVisible> \
		    <DequeueCount>12</DequeueCount> \
		    <MessageText>PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=2</MessageText> \
		    </QueueMessage> \
		</QueueMessagesList>'
		
		var options = { numberofmessages: 10, visibilitytimeout: 60 };
		
		mock.expects("execute").withArgs('get', 'queue1/messages', options, { 'x-ms-version': '2009-09-19', }, null)
							   .yields({statusCode: 201, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}, body: mockResponseBody})
							   .once();
						
		service.getMessages('queue1', options, function(err, data){
			assert.equal(err, null);
			
			assert.equal(data['x-ms-version'], '2009-09-19');
			assert.equal(data['x-ms-request-id'], 'id');
			
			assert.equal(data.messages.length, 2);			
			assert.equal(data.messages[0]['MessageId'], '5974b586-0df3-4e2d-ad0c-18e3892bfca2');
			assert.equal(data.messages[0]['InsertionTime'], 'Fri, 09 Oct 2009 21:04:30 GMT');
			assert.equal(data.messages[0]['ExpirationTime'], 'Fri, 16 Oct 2009 21:04:30 GMT');
			assert.equal(data.messages[0]['PopReceipt'], 'YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw');
			assert.equal(data.messages[0]['TimeNextVisible'], 'Fri, 09 Oct 2009 23:29:20 GMT');
			assert.equal(data.messages[0]['DequeueCount'], 1);
			assert.equal(data.messages[0]['MessageText'], 'PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=');
			
			assert.equal(data.messages[1]['MessageId'], '5974b586-0df3-4e2d-ad0c-18e3892bfca22');
			assert.equal(data.messages[1]['InsertionTime'], 'Fri, 09 Oct 2009 21:04:30 GMT2');
			assert.equal(data.messages[1]['ExpirationTime'], 'Fri, 16 Oct 2009 21:04:30 GMT2');
			assert.equal(data.messages[1]['PopReceipt'], 'YzQ4Yzg1MDItYTc0Ny00OWNjLTkxYTUtZGM0MDFiZDAwYzEw2');
			assert.equal(data.messages[1]['TimeNextVisible'], 'Fri, 09 Oct 2009 23:29:20 GMT2');
			assert.equal(data.messages[1]['DequeueCount'], 12);
			assert.equal(data.messages[1]['MessageText'], 'PHRlc3Q+dGhpcyBpcyBhIHRlc3QgbWVzc2FnZTwvdGVzdD4=2');
		});					

		mock.verify();		
	},
	
	'should return an empty array of messages': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		var mockResponseBody = '<QueueMessagesList> \
		</QueueMessagesList>'
		
		var options = { numberofmessages: 10, visibilitytimeout: 60 };
		
		mock.expects("execute").withArgs('get', 'queue1/messages', options, { 'x-ms-version': '2009-09-19', }, null)
							   .yields({statusCode: 201, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}, body: mockResponseBody})
							   .once();
						
		service.getMessages('queue1', options, function(err, data){
			assert.equal(err, null);
			
			assert.equal(data['x-ms-version'], '2009-09-19');
			assert.equal(data['x-ms-request-id'], 'id');
			
			assert.equal(data.messages.length, 0);
		});					

		mock.verify();		
	},	
	
	'should delete a message from a queue': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('delete', 'queue1/messages/messageid', { popreceipt: 'popreceipt-value' }, { 'x-ms-version': '2009-09-19' }, null)
							   .yields({statusCode: 204, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.deleteMessage('queue1', 'messageid', 'popreceipt-value',function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');
		});					

		mock.verify();		
	},
		
	'should return an error when trying to delete message': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.deleteMessage('queue1', 'messageid', 'popreceipt-value',function(err, data){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},
		
	'should delete all messages from a queue': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('delete', 'queue1/messages', null, { 'x-ms-version': '2009-09-19' }, null)
							   .yields({statusCode: 204, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.clearMessages('queue1',function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');
		});					

		mock.verify();		
	},	

	'should return an error when trying to clear messages': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.clearMessages('queue1', function(err, data){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},
	
	'should update a message': function(){
		var service = new Service({});
		var mock = sinon.mock(service);	

		mock.expects("execute").withArgs('put', 'queue1/messages/messageid', {popreceipt: 'popreceipt-value', visibilitytimeout: 'visibilitytimeout-value' }, { 'x-ms-version': '2009-09-19' }, null)
							   .yields({statusCode: 204, headers: { 'x-ms-version': '2009-09-19', 'x-ms-request-id': 'id'}})
							   .once();

		service.updateMessage('queue1', 'messageid', 'popreceipt-value', 'visibilitytimeout-value', function(err, data){
			assert.equal(err, null);
			assert.equal(data['x-ms-request-id'], 'id');
		});					

		mock.verify();		
	},

	'should return an error when trying to update a messages': function(){
		var service = new Service({});
		var mock = sinon.mock(service);

		mock.expects("execute").yields({statusCode: 404}).once();

		service.updateMessage('queue1', 'messageid', 'popreceipt-value', 'visibilitytimeout-value', function(err, data){
			assert.equal(err.Code, 404);		
		});					

		mock.verify();		
	},
	
}