module.exports = function(opts) {

	var self = this
	
	self.init = function(o) {
	}

	self.trigger = function(opts) {
		try {
			return self.triggers[opts.trigger].do(opts)
		} catch(err) {
			return opts.trigger + ' : ' + err
		}
	}

	self.triggers = {
		'ping' : {
			help : 'simple pong reply',
			do : function(opts) {
				opts.ret = 'pong'
				opts.cb(opts)
			}
		},
		'vping' : {
			help : 'returns the type of the listener that is responding',
			do : function(opts) {
				opts.ret = 'nodejs'
				opts.cb(opts)
			}
		},
	}

	return self.init(opts)
}
