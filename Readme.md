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

	// Creating a new container
	waz.blobs.container.create('myContainer', function(err, result){
	});
	
	// Listing existing containers
	waz.blobs.container.list(function(err, result){
	});

	// Finding a container
	waz.blobs.container.find('myContainer', function(err, container){

			// Getting container's metadata
			container.metadata(function(err, metadata){
			});

			// Adding properties to a container
			container.putProperties({'x-ms-custom' : 'MyValue'}, function(err, result){
			});
			
			// Getting container's ACL
			container.getAcl(function(err, result){
			});
			
			// Setting container's ACL (null, 'blob', 'container')
			container.setAcl('container', function(err, result){
			});
			
			// Listing blobs in a container
			container.blobs(function(err, result){
			});
			
			// Getting blob's information
			result.getBlob('myfolder/my file.txt', function(err, blob){
				
				// Getting blob's contents
				blob.getContents(function(err,data){
					console.log(data);
				});				
			});
						
			// Uploading a new Blob
			result.store('folder/my file.xml', '<xml>content</xml>', 'text/xml', {'x-ms-MyProperty': 'value'}, function(err, result){
			});			
		}
	});
	
	// Deleting containers
	waz.blobs.container.delete('myContainer', function(err){
	});

## Queues
	Coming Soon - If you are anxious, you can always contribute with the project :)

## Tables
	Coming Soon - If you are anxious, you can always contribute with the project :)


# Remaining Stuff
* Documentation
* SharedAccessSignature

## Blobs
* Copy / Delete / Snapshot
* Metadata (get/put)
* Update contents
* Blocks

## Queues
* Everything

## Tables
* Everything

# Known Issues

* Container's putProperties doesn't work.

# Authors

* Juan Pablo Garcia ([jpgarcia](http://github.com/jpgarcia) | [@jpgd](http://www.twitter.com/jpgd))

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
