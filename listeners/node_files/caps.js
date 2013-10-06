module.exports = function(opts) {

	var self = this
	
	self.init = function(o) {
	}

	self.runMe = function(cb) {
		cb(self)
	}

	self.trigger = function(opts) {

        try {
			opts.string = opts.string.join(' ')
            opts.ret = self.triggers[opts.trigger].do(opts)
			opts.cb(opts)
        } catch(err) {
            return opts.trigger + ' : ' + err
        }
	}

	self.triggers = {
		'downcase' : {
			help : 'turns all strings lowercase',
			do : function(opts) {
				return opts.string.toLowerCase()
			},
		},
		'upcase' : {
			help : 'turns all strings uppercase',
			do : function(opts) {
				return opts.string.toUpperCase()
			}
		},
		'caps' : {
			sameAs : 'upcase',
		}

	}

	return self.init(opts)
}
