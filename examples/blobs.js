var waz = require('waz-storage-js');

waz.establishConnection( { accountName: 'your_account_name', accountKey: 'your_account_key', useSsl: false } );

waz.blobs.container.create('test1', function(err, result){
	console.log('\n_________| creating a container |_________\n');
	console.log(err || result);
	
	waz.blobs.container.create('test2', function(err, result){
		console.log('\n_________| creating a container |_________\n');
		console.log(err || result);
		
		waz.blobs.container.list(function(err, containers){
			console.log('\n_________| listing existing containers |_________\n');
			console.log(containers || err.message);
						
			containers[0].putMetadata({'x-ms-meta-Custom' : 'MyValue'}, function(err, result){
				console.log(err || result);
				
				containers[0].metadata(function(err, result){
					console.log('\n_________| showing container metadata |_________\n');
					console.log(err || result);
				});				
			});

			waz.blobs.container.find('test1', function(err, container){
				console.log('\n_________| finding a container |_________\n');
				console.log(err || container);
				
				container.blobs(function(err, blobs){
					console.log(err || blobs)
				});
				
				container.setAcl('container', function(err, result){
					result.getAcl(function(err, result){
						console.log(err || result);
					});
				});
				
				container.store('Folder/hello world.xml', '<xml/>', 'text/xml', {'x-ms-test': 'myvalue'}, function(err, helloBlob){
					console.log(err || helloBlob);
				
					container.getBlob('Folder/hello world.xml', function(err, blob){
						console.log(err || result);
					
						blob.getContents(function(err,data){
							console.log(err || data);
						});

						blob.putMetadata({'x-ms-meta-custom': 'value'}, function(err, result) {
							blob.metadata(function(err, metadata){
								console.log(err || metadata);

								blob.putProperties({'x-ms-blob-custom': 'value'}, function(err, result) {						
									blob.properties(function(err, properties){
										console.log(err || properties);
										
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
					});
				});
			});
		});
	});
});