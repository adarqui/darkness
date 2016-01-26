module.exports = function(opts) {

	var self = this
	
	self.init = function(o) {
	}
	self.getTriggers = function() {
		return [ 'e', 'echo' ]
	}
	self.trigger = function(opts) {
		try {
			opts.string = opts.string.join(' ')
			opts.ret = self.triggers[opts.trigger].do(opts)
			return opts.cb(opts)
		} catch(err) {
			return opts.trigger + ' : ' + err
		}
	}

	self.help = "echo's the strings you supply"
	self.echo = function(opts) {
		return opts.string
	}

	self.triggers = {
		'e' : {
			help : self.help,
			do : self.echo
		},
		'echo' : {
			help : self.help,
			do : self.echo
		},
	}

	return self.init(opts)
}
