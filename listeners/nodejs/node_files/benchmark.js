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
		'benchmark' : {
			help : 'this runs a pre-programmed benchmark',
			do : function(opts) {


				var args = opts.string


console.log("IN BENCHMARK",args)

				switch(args[0]) {
					case "help" : {
						try {
							opts.ret = self.benchmarks[args[1]].help
							opts.cb(opts)
						} catch(err) {
							return
						}
					}
					case "features" : {
						try {
							opts.ret = _.keys(self.benchmarks).join(' ')
							opts.cb(opts)
						} catch(err) {
							return
						}
					}
					default : {
						break
					}
				}

				try {
					return self.benchmarks[args[0]].do(opts,args)
				} catch(err) {
					console.log("err", err)
				}

			}
		},
	}


	self.benchmarks = {
		'randloop' : {
			help : '(benchmark randloop x) => runs rand() x times',
			do : function(opts,args) {
				console.log(opts,args)
				var x = 0
				x = parseInt(args[1],10)
				if(x < 0) x = x * (-1)
				for(var v = 0 ; v < x ; v++) {
					Math.random()
				}
//				opts.ret = args.join(' ')
opts.ret = "randloop,node"
				return opts.cb(opts)
			},
		},
		'readurandom' : {
			help : '(benchmark readurandom x) => reads X bytes from /dev/urandom',
			do : function(opts,args) {
				console.log("URANDOM", opts,args)
				var x = 0
				x = parseInt(args[1],10)
try {
				fs.open("/dev/urandom", 'r',function(err,fd) {
console.log("err", err, "FD", fd)
					var buffer = new Buffer(x)
					fs.read(fd, buffer, 0, x, null, function(err, bytesRead, buffer) {
console.log("ERR", err, "bytesRead", bytesRead)
//						opts.ret = "readurandom " + bytesRead
opts.ret = "readurandom,node"
						return opts.cb(opts)
					})
				})
 } catch(err) {
	console.log(err)
}
			},
		},
	}

	return self.init(opts)
}
