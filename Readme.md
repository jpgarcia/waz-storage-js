# Windows Azure Storage library for Node.js
A simple implementation of Windows Azure Storage API for Node.js

# Installation
waz-storage-js depends on querystring (>= v0.0.1) and xml2js (>= v0.1.9).

To install via npm

	npm install waz-storage-js

# Examples

## Initial Setup

	var waz = waz.establishConnection({ 
			accountName: 'your_account_name'
			, accountKey: 'your_key', 
			, useSsl: false 
		  });

## Blobs

	waz.blobs.container.create('container1', function(err, container1) {
		console.log('\n_________| creating a container |_________\n');
		console.log(err || container1);
	
		waz.blobs.container.create('container2', function(err, container2) {
			console.log('\n_________| creating another container |_________\n');
			console.log(err || container2);
		
			waz.blobs.container.list(function(err, containers) {
				console.log('\n_________| listing existing containers |_________\n');
				console.log(containers || err.message);
						
				containers[0].putMetadata({'x-ms-meta-Custom' : 'MyValue'}, function(err) {
					console.log(err || '`x-ms-meta-Custom` metadata added!');
				
					containers[0].metadata(function(err, metadata) {
						console.log('\n_________| showing container metadata |_________\n');
						console.log(err || metadata);
					});				
				});

				waz.blobs.container.find('container1', function(err, container1) {
					console.log('\n_________| finding a container |_________\n');
					console.log(err || container1);

					container1.blobs(function(err, blobs) {
						console.log('\n_________| listing container blobs |_________\n');
						console.log(err || blobs)
					});
				
					container1.setAcl('container', function(err, container) {
						console.log('\n_________| setting container acl to `container` |_________\n');
						console.log(err || 'container acl set to `container`');					
					
						container.getAcl(function(err, acl) {
							console.log('\n_________| displaying container acl |_________\n');						
							console.log(err || acl);
						});
					});
				
					console.log('\n_________| uploading a blob using blocks |_________\n');
				
					var fs = require('fs');
					var stream = fs.createReadStream('./test/mock-files/sample.txt', { 'flags': 'r' , mode: 0666, 'encoding': 'utf-8', 'bufferSize': 5 });

					var uploader = container1.upload('myBlockBlob', stream, "plain/text", {'x-ms-mymetadata': 'value'}, function(err, block) {
						console.log('\n_________| block uploaded |_________\n');
						console.log('blockid:' + block.identifier);
						console.log('block#:' + block.number);
					
					}, function(err, blob) {
						console.log('\n_________| block list submitted |_________\n');
						console.log(blob);

						blob.getContents(function(err, contents) {
							console.log(contents);
							blob.destroy(function(err) {});
						});
					});
								
					container1.store('Folder/hello world.xml', '<xml/>', 'text/xml', {'x-ms-test': 'myvalue'}, function(err, helloWorldBlob) {
						console.log('\n_________| storing a new blob |_________\n');
						console.log(err || helloWorldBlob);
				
						container1.getBlob('Folder/hello world.xml', function(err, blob) {
							console.log('\n_________| getting a blob |_________\n');						
							console.log(err || blob);
						
							blob.getContents(function(err,data) {
								console.log('\n_________| displaying blob contents |_________\n');
								console.log(err || data);
							});
						
							blob.copy('container2/Folder/helloCopy.xml', function(err, newBlob) {
								console.log('\n_________| copying a blob |_________\n');
								console.log(err || newBlob);
							});
						
							blob.snapshot(function(err, blob) {
								console.log('\n_________| creating a snapshot of a blob |_________\n');
								console.log(err || blob.snapshotDate);
							});

							blob.putMetadata({'x-ms-meta-custom': 'value'}, function(err) {
								console.log('\n_________| adding metadata to the blob |_________\n');
								console.log(err || '`x-ms-meta-custom` metadata added');
							
								blob.metadata(function(err, metadata) {
									console.log('\n_________| displaying blob metadata |_________\n');								
									console.log(err || metadata);

									blob.putProperties({'x-ms-blob-custom': 'value'}, function(err) {						
										console.log('\n_________| adding a property to the blob |_________\n');
										console.log(err || '`x-ms-blob-custom` property added!');
									
										blob.properties(function(err, properties) {
											console.log('\n_________| displaying blob properties |_________\n');
											console.log(err || properties);

											blob.contentType = 'newContentType'
											blob.metadata = {'x-ms-new-metadata': 'value'};
											console.log(blob);
										
											blob.updateContents('new-content', function(err, updatedBlob) {
												console.log('\n_________| updating blob contents |_________\n');
												console.log(err || updatedBlob.requestId);											
												updatedBlob.destroy(function(err) {			
													console.log('\n_________| destroying a blob |_________\n');
													console.log(err || 'blob `' + updatedBlob.path + '` removed!');

													waz.blobs.container.delete('container1', function(err) {
														console.log('\n_________| removing a container |_________\n');
														console.log(err || '`container1` container removed!');
													});

													waz.blobs.container.delete('container2', function(err) {
														console.log('\n_________| removing a container |_________\n');
														console.log(err || '`container2` container removed!');
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
		});
	});

## Queues
	Coming Soon - If you are anxious, you can always contribute with the project :)

## Tables
	Coming Soon - If you are anxious, you can always contribute with the project :)


# Remaining Stuff
* Documentation

## Blobs
* Upload blocks and submit block list separately
* Put Page and Get Page Regions
* Download blobs and persist them as stream in addition to blob.getContents()

## Queues
* Everything

## Tables
* Everything

# Known Issues

* Container's putProperties doesn't work.

# Authors

* Juan Pablo Garcia ([jpgarcia](http://github.com/jpgarcia) | [@jpgd](http://www.twitter.com/jpgd))

# Contributors

* Johnny G. Halife ([johnnyhalife](http://github.com/johnnyhalife) | [@johnnyhalife](http://www.twitter.com/johnnyhalife))
* Ezequiel Julio Morito ([ezequielm](http://github.com/ezequielm) | [@ezequielm](http://www.twitter.com/ezequielm))

# License 

(The MIT License)

Copyright (c) 2010 by Juan Pablo Garcia Dalolla

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
