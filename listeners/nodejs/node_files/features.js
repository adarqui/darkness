module.exports = function(opts) {

	var self = this
	
	self.init = function(o) {
	}

	self.trigger = function(opts) {

		try {
			opts.ret = self.triggers[opts.trigger].do(opts)
			opts.cb(opts)
		} catch(err) {
			return opts.trigger + ' : ' + err
		}
	}

	self.triggers = {
		'features' : {
			help : 'returns the list of supported triggers',
			do : function(opts) {
//				return 'hi'
				return _.keys(c.modules.triggers).join(' ')
			}
		},
	}

	return self.init(opts)
}
