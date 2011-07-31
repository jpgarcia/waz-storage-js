var Base = module.exports = exports = function Base(options) {
	if (!options.accountName) throw new Error('accountName required');
	if (!options.accountKey) throw new Error('accountKey required');
	if (!options.useSsl) options.useSsl = false;
	this.defaultConnection = options;

	exports.blobs = require('../waz-blobs').load(this);
}

exports.establishConnection = function(options, callback){
  return new Base(options);
};