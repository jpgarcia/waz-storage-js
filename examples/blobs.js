var waz = require('waz-storage-js');

waz.establishConnection( { accountName: 'your_account_name', accountKey: 'your_account_key', useSsl: false } );

waz.blobs.container.create('test1', function(err, result){
	console.log('\n_________| creating a container |_________\n');
	console.log(err || result);
	
	waz.blobs.container.create('test2', function(err, result){
		console.log('\n_________| creating a container |_________\n');
		console.log(err || result);
		
		waz.blobs.container.list(function(err, result){
			console.log('\n_________| listing existing containers |_________\n');
			console.log(result || err.message);
						
			result[0].putProperties({'x-ms-Custom' : 'MyValue'}, function(err, result){
				console.log(err || result);
			});

			waz.blobs.container.find('test1', function(err, result){
				console.log('\n_________| finding a container |_________\n');
				console.log(err || result);
				
				result.blobs(function(err, blobs){
					console.log(err || blobs)
				});

				result.store('Folder/hello world.xml', '<xml/>', 'text/xml', {'x-ms-test': 'myvalue'}, function(err, result){
					console.log(err || result);
				});
				
				result.getBlob('Folder/hello world.xml', function(err, blob){
					console.log(err || result);
					
					blob.getContents(function(err,data){
						console.log(err || data);
					});
					
					blob.metadata(function(err, metadata){
						console.log(err || metadata);
					});
				});

				result.setAcl('container', function(err, result){
					result.getAcl(function(err, result){
						console.log(err || result);
					});
				});
				
				result.metadata(function(err, result){
					console.log('\n_________| showing container metadata |_________\n');
					console.log(err || result);
				});
				
				waz.blobs.container.delete('test1', function(err){
					console.log('\n_________| removing a container |_________\n');
					console.log(err || 'test1 container removed!');
				});

				waz.blobs.container.delete('test2', function(err){
					console.log('\n_________| removing a container |_________\n');
					console.log(err || 'test2 container removed!');
				});
			});
		});
	});
});