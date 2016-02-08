var
  Redis = require("redis"),
  DarkKeys = require("darkness_keys")
  ;



var redisLoop = function(conf) {

  var redis_url = "redis://" + conf.redis.host + ":" + conf.redis.port;



  var pub = Redis.createClient(redis_url);

  pub.on('error', function(err) {
    console.log("redis: Error:", err)
  });



  var sub = Redis.createClient(redis_url);

  sub.on('error', function(err) {
    console.log("redis subscriber: Error:", err);
  });

  console.log('subscribing');

  sub.subscribe(DarkKeys.DARK_INTERP_REPLY, function(err,data) {
  })

  sub.subscribe(DarkKeys.DARK_EVENT, function(err,data) {
  })

  sub.on('message', function(channel,data) {
    console.log('channel:', channel, 'data:', data);
    switch(channel) {
      case DarkKeys.DARK_INTERP_REPLY: {
        subscriber_fns.dbot_reply(data);
        break;
      }
      case DarkKeys.DARK_EVENT : {
        console.log('event');
        break;
      }
      default : {
        break;
      }
    }
  });

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
    return;
  }

  var idx = message.indexOf('(');
  var environment = message.substring(1,idx);

  message = message.substring(idx,message.length);

  if(environment.length == 0) environment = 'eval';

  var _request = new d.Scheme({});
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
    });
    pipeline.index = c.index;
    c.pipelines[pipeline.getId()] = pipeline;

    pipeline.evaluate();

    });
  } catch(err) {
    console.log("parse", err);
  }

}



module.exports = {
  redisLoop: redisLoop
}
