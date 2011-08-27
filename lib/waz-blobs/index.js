exports.load = function(base) {		
	exports.container = require('./container').load(base);
	return this;
} 