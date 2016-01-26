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
		'+' : {
			help : 'adds arguments',
			do : function(opts) {
				var args = opts.string
				var result = 0
				for(var v in args) {
					result = result + parseInt(args[v],10)
				}
				return result.toString()
			},
		},
		'-' : {
			help : 'subtracts arguments',
			do : function(opts) {
				var args = opts.string
				var result = 0
				for(var v in args) {
					result = result - parseInt(args[v],10)
				}
				return result.toString()
			}
		},
        '*' : {
            help : 'multiplies arguments',
            do : function(opts) {
                var args = opts.string
                var result = 0
                for(var v in args) {
                    result = result * parseInt(args[v],10)
                }
                return result.toString()
            }
        }, 
		'/' : {
			help : 'divides arguments', 
			do : function(opts) {
				try {
					var args = opts.string
					var result = args[0]
					for(var v  = 1 ; v < args.length ; v++) {
						result = result / parseInt(args[v],10)
					}
					return result.toString()
				} catch(err) {
					return err
				}	
			},
		},
	}

	return self.init(opts)
}
