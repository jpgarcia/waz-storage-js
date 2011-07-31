var crypto = require('crypto')
	,querystring = require('querystring')
	,http = require('http')
	,https = require('https')
	,url = require('url')
	,utils = require('./utils');

exports.CoreService = new CoreService({});

exports = module.exports = CoreService;

function CoreService(options) {
    this.useSasAuthOnly = options.useSasAuthOnly || false;
    this.sharedaccesssignature = options.sharedAccessSignature;
    this.accountName = options.accountName;
    this.accountKey = options.accountKey;
    this.typeOfService = options.typeOfService || "blob";
    this.useSsl = options.useSsl || false;
    this.useDevEnv = options.useDevEnv;
	this.baseUrl = options.baseUrl || "core.windows.net";

	if (!options.useDevEnv)
		this.baseUrl = this.typeOfService + "." +  this.baseUrl
}

CoreService.prototype.generateRequestUri = function(path, options) { 
    var protocol = this.useSsl ? "https" : "http";
	path = path ? path = "/" + path : "/";
		
	var params = "";
	
	if (options && Object.keys(options).length > 0) {
		params = "?" + Object.keys(options)
								.filter(function(p) { return p != 'typeOfService'} )
								.sort(function(a,b){return a.toLowerCase()>b.toLowerCase();})
								.map(function(k){ return (k + '=' + escape(options[k])).toString(); } )
								.join("&");
	}

	return protocol +  ":\/\/" +  this.accountName + '.' +  this.baseUrl + path.replace("//", "/") + params;
};

CoreService.prototype.canonicalizeHeaders = function(headers){
 	return Object.keys(headers)
					.filter(function(k) { return k.match(/^x-ms/) })
					.sort(function(a,b){return a>b;})
					.map(function(k){
						return k.toLowerCase() + ":" + headers[k].toString().trim()
					}).sort(function(a,b){return a>b;}).join("\x0A");
};

CoreService.prototype.canonicalizeMessage = function(url){
	var uriComponent = url.replace(/https?:\/\/[^\/]+\//i, '').replace(/\?.*/i, '');
    var compMatches = url.match(/comp=[^&]+/i);

	if (compMatches)
		uriComponent += "?" + compMatches[0]

    return "/" + this.accountName + "/" + uriComponent;
};

CoreService.prototype.canonicalizeMessage20090919 = function(url){
	var queryComponent = "";
	var uriComponent = url.replace(/https?:\/\/[^\/]+\//i, '').replace(/\?.*/i, '');
    var queryMatches = url.match(/\?(.*)/i);

	if (queryMatches && queryMatches.length > 0) {
		queryComponent = "\n" + queryMatches[1].split('&')
											.map(function(p) { return unescape(p.split('=').join(':')); } ) 
											.sort(function(a,b){ return a.toLowerCase()>b.toLowerCase(); })
											.join('\n');
	}

	return "/" + this.accountName + "/" + uriComponent + queryComponent;
}

CoreService.prototype.generateSignature = function(options){
	if (options.headers['x-ms-version'] == "2009-09-19")
  		return this.generateSignature20090919(options);

	var signature = options.method.toUpperCase() + "\x0A" +
		              (options.headers["Content-MD5"] ? options.headers["Content-MD5"] : "") + "\x0A" +
		              (options.headers["Content-Type"] ? options.headers["Content-Type"] : "") + "\x0A" +
		              (options.headers["Date"] ? options.headers["Date"] : "") + "\x0A";

	if (this.typeOfService != 'table')
		signature += this.canonicalizeHeaders(options.headers) + "\x0A";

	signature += this.canonicalizeMessage(options.url);
	
	return crypto.createHmac('RSA-SHA256', this.accountKey.base64decode()).update(signature).digest('base64');
}

CoreService.prototype.generateSignature20090919 = function(options){
	var signature = options.method.toUpperCase() + "\x0A" +
		            (options.headers["Content-Encoding"] ? options.headers["Content-Encoding"] : "") + "\x0A" +
					(options.headers["Content-Language"] ? options.headers["Content-Language"] : "") + "\x0A" +
					(options.headers["Content-Length"] ? options.headers["Content-Length"] : "0") + "\x0A" +
		            (options.headers["Content-MD5"] ? options.headers["Content-MD5"] : "") + "\x0A" +
		            (options.headers["Content-Type"] ? options.headers["Content-Type"] : "") + "\x0A" +
		            (options.headers["Date"] ? options.headers["Date"] : "") + "\x0A" +
		            (options.headers["If-Modified-Since"] ? options.headers["If-Modified-Since"] : "") + "\x0A" +
		            (options.headers["If-Match"] ? options.headers["If-Match"] : "") + "\x0A" +
		            (options.headers["If-None-Match"] ? options.headers["If-None-Match"] : "") + "\x0A" +				
		            (options.headers["If-Unmodified-Since"] ? options.headers["If-Unmodified-Since"] : "") + "\x0A" +
		            (options.headers["Range"] ? options.headers["Range"] : "") + "\x0A" +
					this.canonicalizeHeaders(options.headers) + "\x0A" + 
					this.canonicalizeMessage20090919(options.url);

	return crypto.createHmac('RSA-SHA256', this.accountKey.base64decode()).update(signature).digest('base64');
}

CoreService.prototype.execute = function(verb, path, query, headers, payload, callback){
	var error, data;
	var parsedUrl = url.parse(this.generateRequestUri(path, query));
	var headers = headers ? headers : {};

	headers = headers.merge({ 'x-ms-date' : new Date().toUTCString() });

	if (payload)
		headers = headers.merge({'Content-Length' : payload.length });
    else
		headers = headers.merge({'Content-Length' : 0 });
	
	var params = { method: verb, headers : headers, url : parsedUrl.href };

	headers = headers.merge({ 'Authorization' : 'SharedKey ' + this.accountName + ':' + this.generateSignature(params) });

	var options = {
		host: parsedUrl.host,
		port: parsedUrl.protocol == 'https:' ? 443: 80,
		path: (parsedUrl.pathname + "?" + (parsedUrl.query || "")).replace(/\?$/, ''),
		method: verb,
		headers: headers	
	};

	var request = require(parsedUrl.protocol.replace(':','')).request(options, function(response) {      
		response.setEncoding('utf8');

		var body = [];
		response.addListener('data', function (chunk) {
			body.push(chunk);
		});
		
		response.addListener('end', function () {
			if (response.statusCode >= 400)
				error = { statusCode: response.statusCode };
			else
				data = { headers: response.headers, body: body.join(""), statusCode: response.statusCode };

			callback(error, data);
		});
	});	
	
	if (payload) request.write(new Buffer(payload, 'utf-8'))
	
	request.end();
}