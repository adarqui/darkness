var redis = require('redis')
var sc = require('syscalls.js')
fs = require('fs')
_ = require('underscore')

c = {
	red : {},
	sub : {},	
	whoami : 'nodejs',
	modules : {},
}


var init = {
	modules : function() {

		c.modules = {
			triggers : {},
		}

		var files = fs.readdirSync('./node_files')
		for(var v in files) {
			var file = files[v]
            var truth = file.match(/.*js$/g)
			if(!truth) continue
			var base = file.split('.')[0]
			c.modules[base] = require('./node_files/'+file)

			c.modules[base] = new c.modules[base]()

			var triggers = _.keys(c.modules[base].triggers)
			for(var y in triggers) {
				var trig = triggers[y]

				if(c.modules[base].triggers[triggers[y]].sameAs != undefined) {
					var same = c.modules[base].triggers[triggers[y]].sameAs
					c.modules[base].runMe(function(xself) {
						xself.triggers[triggers[y]] = xself.triggers[same]
					})
				}

				c.modules.triggers[triggers[y]] = c.modules[base]
			}

		}
	},

	redis : function() {
		c.red = redis.createClient()
		c.sub = redis.createClient()

		c.red.on('error', function(err,data) {
		})

		c.sub.subscribe('dbot:eval', function(err,data) {
		})

		c.sub.subscribe('dbot:'+c.whoami, function(err,data) {
		})

	},
	me : function() {
		init.modules()
		init.redis()
	},	
}

init.me()



var subscriber_fns = {

	_cb : function(opts) {
		var generic
		opts.ts2 = sc.times()

		opts.bundle.ts.command.times = [ opts.ts1, opts.ts2 ]
		if(opts.ret.length >= 0) {

			generic = subscriber_fns.createChannel(opts.bundle)
			c.red.publish('dbot:reply', generic+opts.ret)
		}
	},


	createChannel : function(bundle) {

		var ts1 = bundle.ts.command.times[0]
		var ts2 = bundle.ts.command.times[bundle.ts.command.times.length-1]

		bundle.ts.command.system = ts2.stime - ts1.stime
		bundle.ts.command.user = ts2.utime - ts1.utime

		var generic = bundle.id.pipeline + ':' + bundle.id.expression + ':' + bundle.type + ':' + bundle.opts + ':' + bundle.ts.command.user + ':' + bundle.ts.command.system + ':' + bundle.node.tunnel + ':' + bundle.node.listener + ':' + bundle.chat.from + ':' + bundle.chat.to + ':'

		return generic

	},
	dbot_raw : function(data) {

	    var json = ""
    	try {
        	json = JSON.parse(data)
    	} catch(err) {
        	return
    	}

	},
	dbot_eval : function(data) {
		subscriber_fns.dbot_general("eval", data)
	},
	dbot_general : function(type, data) {

/*
stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>
*/

		var re = /(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*)/.exec(data)

		if(re == null || typeof re !== 'object' || re.length < 4) return

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
					system : re[6],
				},
			},
			node : {
				tunnel : re[7],
				listener : c.whoami,
			},
			chat : {
				from : re[9],
				to : re[10],
				message : re[11],
			}
		}

		try {
			bundle.chat.message = JSON.parse(bundle.chat.message);
		} catch(err) {
			console.log("EH err", err)
			return
		}

		bundle.trigger = {
			cmd : bundle.chat.message[0],
			msg : bundle.chat.message,
		}

		bundle.chat.message.splice(0,1)


		try {

			var o
			var ret
			var ts1, ts2

			if(bundle.trigger.cmd == 'help') {
				/* return the help string */
				o = c.modules.triggers[bundle.trigger.msg[0]]
				ret =  o.triggers[bundle.trigger.msg[0]].help


				ts1 = sc.times()

				subscriber_fns._cb(
				{
					ts1: ts1,
					ts2: ts2,
					bundle : bundle,
					trigger:bundle.trigger.cmd,
					string:bundle.trigger.msg,
					ret : ret
				})


			}
			else {
				/* process the trigger */
				o = c.modules.triggers[bundle.trigger.cmd]

				ts1 = sc.times()

				o.trigger({
					ts1: ts1,
					ts2: ts2,
					bundle : bundle,
					trigger:bundle.trigger.cmd,
					string:bundle.trigger.msg,
					cb: subscriber_fns._cb
				})
			}

		} catch(err) {
			console.log(err)
		}
	},
}


c.sub.on('message', function(channel,data) {

	switch(channel) {
		case "dbot:eval": {
			subscriber_fns.dbot_eval(data)
			break
		}
		case "dbot:"+c.whoami : {
			subscriber_fns.dbot_eval(data)
			break
		}
		default : {
			break
		}
	}

})

