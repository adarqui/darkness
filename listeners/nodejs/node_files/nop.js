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
		'nop' : {
			help : 'simple pong reply',
			do : function(opts) {
				return ''
			}
		},
	}

	return self.init(opts)
}
