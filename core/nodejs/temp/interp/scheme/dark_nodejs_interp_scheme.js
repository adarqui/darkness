var strings;
var d;
var c;
var handle;


var
  Responder = require("./Responder.js")
  ;

//  Redis      = require("redis"),
//  Scheme     = require("scheme.js"),
//  RandString = require("randstrings),



var initHandle = function() {
  handle = {
    index : index,
    pipelines : pipelines
  }
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



var usage = function() {
  console.log("./dark_nodejs_interp_scheme <config_file>");
  process.exit(1);
}



var main = function(argv, argc) {

  if (argc < 3) {
    usage();
  }

  var conf = require(argv[2]);
  console.log(conf);

  Responder.redisLoop(conf);
}



main(process.argv, process.argv.length);
