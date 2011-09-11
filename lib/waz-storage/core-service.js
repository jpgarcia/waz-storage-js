var crypto = require('crypto')
	, querystring = require('querystring')
	, http = require('http')
	, https = require('https')
	, url = require('url')	
	, xml2js = require('xml2js')
	, utils = require('./utils');

exports.CoreService = new CoreService;

exports = module.exports = CoreService;

function CoreService(options) {
	if (!this.options)
		this.options = {};
			
	this.options.merge(options || {});
}

CoreService.prototype.init = function(){
    this.useSasAuthOnly = this.options.useSasAuthOnly || false;
    this.accountName = this.options.accountName;
    this.accountKey = this.options.accountKey;
    this.typeOfService = this.options.typeOfService || "blob";
    this.useSsl = this.options.useSsl || false;
    this.useDevEnv = this.options.useDevEnv;
	this.baseUrl = this.options.baseUrl || "core.windows.net";

	if (!this.options.useDevEnv)
		this.baseUrl = this.typeOfService + "." +  this.baseUrl
}

CoreService.prototype.generateRequestUri = function(path, options) {
	this.init();
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
	this.init();	
 	return Object.keys(headers)
					.filter(function(k) { return k.match(/^x-ms/) })
					.sort(function(a,b){return a>b;})
					.map(function(k){
						return k.toLowerCase() + ":" + headers[k].toString().trim()
					}).sort(function(a,b){return a>b;}).join("\x0A");
};

CoreService.prototype.canonicalizeMessage = function(url){
	this.init();	
	var uriComponent = url.replace(/https?:\/\/[^\/]+\//i, '').replace(/\?.*/i, '');
    var compMatches = url.match(/comp=[^&]+/i);

	if (compMatches)
		uriComponent += "?" + compMatches[0]

    return "/" + (this.accountName || options.accountName) + "/" + uriComponent;
};

CoreService.prototype.canonicalizeMessage20090919 = function(url){
	this.init();	
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
	this.init();
	
	if (options.headers['x-ms-version'] != undefined && options.headers['x-ms-version'] == "2009-09-19")
  		return this.generateSignature20090919(options);

	var signature = options.method.toUpperCase() + "\x0A" +
					(options.headers["Content-MD5"] != undefined ? options.headers["Content-MD5"] : "") + "\x0A" +
					(options.headers["Content-Type"] != undefined ? options.headers["Content-Type"] : "") + "\x0A" +
					(options.headers["Date"]  != undefined ? options.headers["Date"] : "") + "\x0A";

	if (this.typeOfService != 'table')
		signature += this.canonicalizeHeaders(options.headers) + "\x0A";

	signature += this.canonicalizeMessage(options.url);

	return crypto.createHmac('RSA-SHA256', new Buffer(this.accountKey, 'base64').toString('binary')).update(new Buffer(signature, 'utf8')).digest('base64');
}

CoreService.prototype.generateSignature20090919 = function(options){
	this.init();
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

	return crypto.createHmac('RSA-SHA256', new Buffer(this.accountKey, 'base64').toString('binary')).update(new Buffer(signature, 'utf8')).digest('base64');
}

CoreService.prototype.generateRequestOptions = function(verb, path, query, headers, payload){
	this.init();
	var parsedUrl = url.parse(this.generateRequestUri(path, query));
	var headers = headers ? headers : {};

	headers = headers.merge({ 'x-ms-date' : new Date().toUTCString() });

	if (payload)
		headers = headers.merge({'Content-Length' : payload.length });
    else
		headers = headers.merge({'Content-Length' : 0 });
	
	var params = { method: verb, headers : headers, url : parsedUrl.href };
	
	headers = headers.merge({ 'Authorization' : 'SharedKey ' + this.accountName + ':' + this.generateSignature(params) });

	return {
		host: parsedUrl.host,
		port: parsedUrl.protocol == 'https:' ? 443: 80,
		path: (parsedUrl.pathname + "?" + (parsedUrl.query || "")).replace(/\?$/, ''),
		method: verb,
		headers: headers,
		protocol: parsedUrl.protocol.replace(':','')	
	};
}

CoreService.prototype.parseError = function(response, callback){	
	if (response.statusCode < 400)
		return false;

	if (!response.body) {
		callback({Code: response.statusCode, Message: 'An error ocurred'});		
	} else {		
        new xml2js.Parser().on('end', function(result) {
			callback(result);
		}).parseString(response.body);
	}
	
	return true;
}

CoreService.prototype.execute = function(verb, path, query, headers, payload, callback){
	this.init();	
	var error, data;
	var requestOptions = this.generateRequestOptions(verb, path, query, headers, payload);
	
	var request = require(requestOptions.protocol).request(requestOptions, function(response) {      
		response.setEncoding('utf8');

		var body = [];
		response.on('data', function (chunk) {			
			body.push(chunk);
		});
					
		response.on('end', function () {
			var result = response.merge({body: body.join('')});
			
			// TODO: remove on parameter previously used to return err as the first parameter
			callback(result, result);
		});
	});	
	
	if (payload) request.write(new Buffer(payload, 'utf-8'))
	
	request.end();
}