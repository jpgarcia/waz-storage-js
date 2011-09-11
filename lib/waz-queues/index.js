exports.load = function(base) {		
	exports.container = require('./queues').load(base);
	return this;
}