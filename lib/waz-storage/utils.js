Object.prototype.merge = function(obj) {
	if (!obj) obj = {};	
	var keys = Object.keys(obj);
	for (var i = 0, len = keys.length; i < len; ++i) {
	  var key = keys[i];
	  this[key] = obj[key]
	}
	return this;
};

Object.prototype.isString = function() {
	return typeof this === "string" || this instanceof String;
};

Object.prototype.flatten = function flatten() {
	var result = [], i, len = this && this.length;
	
	if(len && !this.isString()) {
		for(i = 0; i < len; i++) {
			result = result.concat(this[i].flatten());
		}
	} else if(len !== 0) {
		result.push(this);
	}
	
	return result;
};