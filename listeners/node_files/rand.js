var randstring = require('randstring')

module.exports = function(opts) {

	var self = this
	
	self.init = function(o) {
	}
	self.trigger = function(opts) {
		try {
			opts.ret =  self.triggers[opts.trigger].do(opts)
			opts.cb(opts)
		} catch(err) {
			return opts.trigger + ' : ' + err
		}
	}

	self.triggers = {
		'rand' : {
			help : 'returns a random integer, (rand num) => returns a random integer between 0 and num',
			do : function(opts) {
				var args = opts.string;
				var cieling = 100;
				if(args[0] != undefined) { cieling = parseInt(args[0],10) }
				//var r = Math.random()/Math.floor(cieling)	
				var r = Math.floor((Math.random()*cieling)+1);
				return r.toString()
			},
		},
		'randf' : {
			help : 'returns a random float between -1 and 1',
			do : function(opts) {
				return Math.random().toString()
			}
		},
		'rands' : {
			help : 'returns a random string, (rands num) => first argument is how many characters',
			do : function(opts) {
				var args = opts.string;
				var limit = 50
				if(args[0] != undefined) { limit = parseInt(args[0],10) }
				return randstring(limit)
			}
		},
	}

	return self.init(opts)
}
