// https://github.com/martynsmith/node-irc
// https://github.com/warfares/pretty-json

// ---- deps -----

var strings
var d
var c
var handle


var initStrings = function() {
	return {
		config : 'config.js',
	}
}

var initDeps = function() {
	return {
		net : require('net'),
		redis : require('redis'),
		Scheme : require('./scheme.js'),
		rands : require('randstring'),
		config : require('./config/tunnel/'+strings.config),
		express : require('express'),
		io  : require('socket.io'),
		http : require('http'),
		_ : require('underscore'),
	}
}

// ---- deps -----

var initConf = function() {
	return d.config
}

var initEnv = function() {
	var conf = process.env['CONFIG']
	if(conf != undefined) { strings.config = conf}
}

var initId = function() {
	c.author.id = d.rands(5)
}

var initIndex = function() {
	c.index = 0
}

var initExpress = function() {

        /*
         * Initialize express routes/middleware
         */
		c.http.app = d.express()
        c.http.app.use(d.express.logger())
        c.http.app.use(d.express.cookieParser())
        c.http.app.use(d.express.bodyParser())
		c.http.app.use(d.express.favicon())
        c.http.app.use(d.express.session({ secret: "secret" }))

        if(c.http.basicAuth == true) {
            c.http.app.use(d.express.basicAuth('root', 'pa11word'));
        }

        c.http.app.use(middleware.fixBody)
        c.http.app.use(middleware.auth)
        c.http.app.use('/static',d.express.static(c.http.options.pub))

        c.http.server = d.http.createServer(c.http.app).listen(c.http.port)
        c.http.io = d.io.listen(c.http.server)

		c.http.app.get('/pipelines/all', handle.pipelines.all)
		c.http.app.get('*', handle.index)
}

var initIO = function() {
        /*
         * Initialize socket.io - this will come in handy later
         */
        c.http.io.on('connection', function(socket) {
            socket.on('join', function(data) {
/*
                if(typeof data.room !== 'string') {
                    return
                }

                socket.join(data.room)
*/
            })
            socket.on('leave', function(data) {
/*
                if(typeof data.room != 'string') {
                    return
                }
                socket.leave(data.room)
*/
            })
        })
}


var initHandle = function() {
	handle = {
		index : index,
		pipelines : pipelines
	}
}



/*----------------------------------------------------------------------------------------
-------
 * Middleware                                                                             
      *
 *----------------------------------------------------------------------------------------
-----*/

var middleware = {
    /* This centralizes request parameters */
    fixBody : function(req,res,next) {
        req.request = undefined
        if(d._.size(req.body) > 0) { req.request = req.body }
        else if (d._.size(req.query) > 0) { req.request = req.query }
        else if(d._.size(req.params) > 0) { req.request = req.params }

        if(req.request == undefined) { req.request = {} }
        next()
    },
    auth: function(req,res,next) {
        return next()
    },
}






var pipelines = {
	all : function(req,res,next) {
		var array = {}
		var _pipelines = d._.clone(c.pipelines)
		for(var v in _pipelines) {
			var _pipeline = _pipelines[v]
			delete _pipeline.special
			array[_pipeline.index] = _pipeline
		}
		res.json(array)
	}
}

var index = function(req,res,next) {
	return res.sendfile(__dirname+'/pub/'+'index.html')
}



var Pipeline = function(opts) {
	var self = this

	self.id = {}
	self.channel = "dbot:unowned"
	self.expressions = []
	self.expressions_length = 0
	self.evaluated = {}
	self.evaluated_length = 0
	self.js = opts.js

	self.node = {
		tunnel : c.author.name,
		listener : "any",
	}

	self.chat = {
		from : "from",
		to : "to",
		message : "message",
	}

	self.init = function(o) {
		self.setId()	
		self.setExpressions(o)
		self.expressions_length = self.getExpressionsLength()

		self.setChat(o)
		self.setChannel(o.channel)

		self.indexInc()
	}
	self.indexInc = function() {
		c.index+=1
	}
	self.getExpressionsLength = function() {
		return self.expressions.length
	}
	self.setChat = function(o) {
		self.chat.from = o.chat.from
		self.chat.to = o.chat.to
		self.chat.message = o.chat.message
	}
	self.setNode = function(o) {
		self.node.tunnel = o.node.tunnel
		self.node.listener = o.node.listener
		self.node.message = o.node.message
	}
	self.setId = function() {
		self.id = Math.random()
//		self.id = c.index
		return self.id
	}
	self.getId = function() {
		return self.id
	}
	self.setChannel = function(channel) {
		if(channel != undefined) {
			self.channel = channel
		}
	}
	self.getChannel = function() {
		return self.channel
	}
	self.setExpressions = function(o) {
		self.expressions = o.expressions
	}
	self.getExpressions = function() {
		return self.expressions
	}
	self.setResponse = function(response) {

		response.ts.response = (new Date()).valueOf()

		var element = self.evaluated[response.id.expression]
		if(element == undefined) {
			self.evaluated[response.id.expression] = response
			self.evaluated[response.id.expression].responses = []
			return true
		} else {
			element.responses.push(response)	
			return false
		}
		
	}


	/*
	 * Special bot commands
	 */
	self.specialFill = function() {
	}

	self.special = {
		'times' : {
			help : 'returns the times (user and system space) a set of expression(s) took',
			do : function(element) {

console.log(JSON.stringify(self.evaluated,null,4))

var opts = {
	time : {
		utime : 0,
		stime : 0,
		stack : [],
	}
}

                self.fillExpression(element, opts)

var new_args = []

new_args.push('e')
new_args.push(opts.time.utime)
new_args.push(opts.time.stime)
new_args.push(JSON.stringify(opts.time.stack))
element.args = new_args

                return { type : 'run' }
			}
		},
		'time' : {
			help : 'returns the times (user and system space) a set of expression(s) took',
			do : function(element) {
				var ret = self.special.times.do(element)
				element.args.splice(3,1)
				return ret
			},
		},
		'utime' : {
			help : 'returns the userspace time a set of expression(s) took',
			do : function(element) {
				var ret = self.special.times.do(element)
				element.args.splice(2,2)
				return ret
			},
		},
		'stime' : {
			help : 'returns the system space time a set of expression(s) took',
			do : function(element) {
				var ret = self.special.times.do(element)
				element.args.splice(1,1)
				element.args.splice(2,1)
				return ret
			}
		},
		'who' : {
			help : 'returns the listener node which evaluated the expression',
			do : function(element) {

				self.fillExpression(element, opts)

				var new_args = [ 'e', opts.who ]
				for(var v = 1 ; v < element.args.length ; v++) {
					new_args.push(element.args[v])
				}
				element.args = new_args
				return { type : 'run' }
			},
		},
		'whoami' : {
			help : 'returns the user who executed the command',
			do : function(element) {
				element.args = [ 'e' , self.js.nick ]
				return { type : 'run' }
			},
		},
		'irc:get:target' : {
			help : 'gets the target that shit message should go to',
			do : function(element) {
				element.args = [ 'e', self.js.args[0] ]
				return { type : 'run' }
			}
		},
		'irc:set:target' : {
			help : 'sets the privmsg target',
			do : function(element) {

				self.fillExpression(element)
				self.js.args[0] = element.args[1]
				element.args[0] = 'nop'
				return { type : 'run' }
			},
		},
		'irc:get:nick' : {
			help : 'gets the current nickname',
			do : function(element) {
				element.args = [ 'e', 'poop' ]
				return { type : 'run' }
			},
		},
		'irc:set:nick' : {
			help : 'changes the bot nickname',
			do : function(element) {
				return { type : 'skip' }
			}
		},
		'irc:get:server' : {
			help : 'get the current irc servers',
			do : function(element) {
				element.args = ['e', self.js.server.address]
				return { type : 'run' }
			},
		},
		'irc:get:servers' : {
			help : 'get the current configured list of servers',
			do : function(element) {
				return { type : 'skip' }
			},
		},
		'irc:set:server' : {
			help : 'set the irc server that this message gets sent to',
			do : function(element) {
                self.fillExpression(element)
                self.js.server.name = element.args[1]
                element.args[0] = 'nop'
                return { type : 'run' }
			}
		},
	}

	self.parseSpecial = function(element) {
		try {
			var special_cmd = self.special[element.args[0]]
			var res = special_cmd.do(element)

			switch(res.type) {
				case 'skip' : {
					self.expressions.splice(0,1)
        			self.evaluated_length += 1
					return true
				}
				case 'run' : {
					return false
				}
				default : {
					return false
				}
			}
		} catch(err) {
			return false
		}
	}

	self.evaluate = function() {

		/* are we done */
		var difference = self.expressions_length - self.evaluated_length

		if(difference == 1 && self.evaluated_length != 0) return 1


		/* publishes the 'deepest' expression */
		var element = self.expressions[0]
	
		var truth = self.parseSpecial(element)
		if(truth == true) { return self.evaluate() }

		var sub_channel = self.createSubChannel(element.id)

		self.expressions.splice(0,1)

		var created_message = self.createMessage(sub_channel, element)
		var created_channel = self.getChannel()

		c.redis.pub.publish(created_channel, created_message)

		self.evaluated_length += 1

		return difference
	}

	self.createMessage = function(sub_channel, expression) {

		self.fillExpression(expression)

		var message = sub_channel + ':' + JSON.stringify(expression.args)
		return message	
	}


	self.createSubChannel= function(expression_id) {

/*

stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>


*/

		
        var bundle = {
            id : {
                pipeline : self.id,
                expression : expression_id,
            },
            type : "eval", 
            opts : "null",
            ts : {
                command : {
					user : "0",
					system : "0",
                },
            },
            node : {
                tunnel : self.node.tunnel,
                listener : self.node.listener,
            },
            chat : {
                from : self.chat.from,
                to : self.chat.to,
            },
        }

		return bundle.id.pipeline+":"+bundle.id.expression+":eval:null:0:0:"+bundle.node.tunnel+":"+bundle.node.listener+":"+bundle.chat.from+":"+bundle.chat.to


	}

	self.fillExpression = function(expression, opts) {


		if (opts == undefined) opts = {}

        for(var v in expression.args) { 
            var arg = expression.args[v]
            if(typeof arg === 'object') {
                var response = self.evaluated[arg.id]
                if(response != undefined) {
                    expression.args[v] = response.chat.message


if(opts.time != undefined) {
	var user = parseInt(response.ts.command.user,10)
	var sys = parseInt(response.ts.command.system,10)

	opts.time.utime += user
	opts.time.stime += sys

	opts.time.stack.push([user,sys])

console.log("opts.time", opts.time)
}

opts.who = response.node.listener

                } else {
                    expression.args[v] = ''
                }

            }
        }

	}


	self.finalEvaluation = function() {

		for(var v in self.expressions) {
			var expression = self.expressions[v]
			self.fillExpression(expression)
		}

		self.js.result = self.expressions[0].args.join(' ')
		return self.js
	}

	self.destroy = function() {
		c.pipelines[self.id] = {}
		delete c.pipelines[self.id]
	}

	

	return self.init(opts)
}


var initRedis = function() {
	c.redis.pub = d.redis.createClient()

	c.redis.pub.on('error', function(err) {
		console.log("redis: Error:", err)
	})

	c.redis.sub = d.redis.createClient()

	c.redis.sub.on('error', function(err) {
		console.log("redis subscriber: Error:", err)
	})

	c.redis.sub.subscribe('dbot:reply', function(err,data) {
	})


	c.redis.sub.on('message', function(channel,data) {
    	switch(channel) {
        	case 'dbot:reply' : {
            	subscriber_fns.dbot_reply(data)
            	break
        	}
        	default : {
            	break
        	}
    	}
	})
}



var subscriber_fns = {
	dbot_reply : function(data) {

/*
stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-user-parse>:<ts-sys-parse>:<ts-user-command>:<ts-sys-commandd>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-user-parse>:<ts-sys-parse>:<ts-user-command>:<ts-sys-commandd>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>
*/

		var re = /(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*)/.exec(data)

		var bundle = {
			id : {
				pipeline : re[1],
				expression : re[2],
			},
			type : re[3],
			opts : re[4],
			ts : {
				command : {
					user : re[5],
					system : re[6]
				},
			},
			node : {
				tunnel : re[7],
				listener : re[8],
			},
			chat : {
				from : re[9],
				to : re[10],
				message : re[11],
			},
		}


		if(bundle.chat.to.indexOf('#') < 0) {
			bundle.chat.to = bundle.chat.from
		}

		var element = c.pipelines[bundle.id.pipeline]
		if(element === undefined) {
			console.log("UNDEFINED")
			return
		}

		var truth = element.setResponse(bundle)
		if(truth == true) {
			var ret = element.evaluate()
		}

		if(ret != 1) return

		switch(bundle.type) {
			case 'eval': {
				var result = element.finalEvaluation()
				c.net.chan.write(JSON.stringify(result))
			}
			default : {
				break
			}
		}
	}
}


var parseMessageToRedis = function(js) {
}

var parseIRC = function(js) {

	var js
	try {
		js = JSON.parse(js)
	} catch(err) {
		console.log(err)
		return
	}

	switch(js.command) {
		case 'PRIVMSG' : {
			return parseMessage(js, js.args[1])
			break
		}
		default : {
		}
	}
}


var parseMessage = function(js, message) {

	if(js.command != 'PRIVMSG' || (js.command == 'PRIVMSG' && js.args[1][0] != '^')) {
		return
	}

	var idx = message.indexOf('(')
	var environment = message.substring(1,idx)

	message = message.substring(idx,message.length)

	if(environment.length == 0) environment = 'eval'

		var _request = new d.Scheme({})
		try {
		var list = _request.parse(message, function(output) {

			var pipeline = new Pipeline({
				expressions : output,
				js : js,
				chat : {
					from : js.nick,
					to : js.args[0],
					message : message,
					environment : environment
				},
				channel : 'dbot:'+environment,
			})
			pipeline.index = c.index
			c.pipelines[pipeline.getId()] = pipeline

			pipeline.evaluate()

		})
		} catch(err) {
			console.log("parse", err)
		}

}

var initNet = function() {
	c.net.chan = d.net.connect({
		host : c.net.host,
		port : c.net.port,
	}, function(val) {
		console.log("connected", val)
	})

	c.net.chan.on('data', function(data) {
		var message = data.toString()
		parseIRC(message)

	})
	c.net.chan.on('end', function() {
		console.log("disconnected")
	})
}




var init = function() {
	strings = initStrings()
	initEnv()
	d = initDeps()
	c = initConf()
	initId()
	initIndex()
	initHandle()
	initRedis()
	initExpress()
	initIO()
	initNet()
}

init()
