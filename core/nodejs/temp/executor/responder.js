var
  Redis     = require("redis"),
  DarkKeys  = require("darkness_keys"),
  DarkIrc   = require("darkness_irc"),
  ArgParser = require("argparser-js"),
  _         = require("lodash")
  ;



var redisLoop = function(o) {

  var conf = o.config;
  var commands = o.commands;

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

  sub.subscribe(DarkKeys.DARK_EVENT, function(err,data) {
  })

  sub.on('message', function(channel,data) {
    var json = JSON.parse(data);
    switch(channel) {
      case DarkKeys.DARK_EVENT : {
        var payload = new Buffer(json['event'].payload, 'base64').toString('ascii');
        var message = DarkIrc.parse(DarkIrc.clean(payload));
        if (message == null) {
          break;
        }
        if (message[2] != "PRIVMSG") {
          break;
        }
        if (_.head(message[4]) == ".") {
          var rest = _.tail(message[4]);
          var argv = ArgParser.parse(ArgParser.defaultParseOptions, rest);
          console.log("TRIGGER", argv);
        }
      }
      default : {
        break;
      }
    }
  });

}



module.exports = {
  redisLoop: redisLoop
}
