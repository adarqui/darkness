(function() {
"use strict";


var
  cproc      = require("child_process"),
  Redis      = require("redis"),
  DarkEvents = require("darkness_events"),
  DarkKeys   = require("darkness_keys"),
  DarkIrc    = require("darkness_irc"),
  ArgParser  = require("argparser-js"),
  _          = require("lodash")
  ;



var redisLoop = function(redis_config, executor_config) {

  var commands = process.env.DARK_CMD;
  if (commands === undefined) {
    console.error("DARK_CMD environment variable not defined: should point to the commands/ directory");
    process.exit(1);
  }

  var COMMANDS_PATH = commands + ":" + (commands + "/bin");

  if (executor_config.prefix === undefined) {
    console.error("executor_config: prefix must be specified");
    process.exit(1);
  }

  var redis_url = "redis://" + redis_config.redis.host + ":" + redis_config.redis.port;



  var pub = Redis.createClient(redis_url);

  pub.on('error', function(err) {
    console.log("redis: Error:", err);
  });



  var sub = Redis.createClient(redis_url);

  sub.on('error', function(err) {
    console.log("redis subscriber: Error:", err);
  });

  console.log('subscribing');

  sub.subscribe(DarkKeys.DARK_EVENT, function(err,data) {
  });

  sub.on('message', function(channel,data) {

    var json = JSON.parse(data);

    switch(channel) {

      case DarkKeys.DARK_EVENT : {

        var payload = new Buffer(json.event.payload, 'base64').toString('ascii');
        var irc_message = DarkIrc.parse(DarkIrc.clean(payload));

        if (irc_message === null) {
          break;
        }

        if (irc_message[2] != "PRIVMSG") {
          break;
        }

        var dark_message = irc_message[4].replace(/\0/g, '');

        if (_.startsWith(dark_message, executor_config.prefix)) {

          var rest = _.drop(dark_message, executor_config.prefix.length);
          var argv = ArgParser.parse(ArgParser.defaultParseOptions, rest);
          console.log("TRIGGER", argv);

          if (_.head(argv).indexOf(".") >= 0) {
            console.log("ILLEGAL CHARACTER ATTEMPT", _.head(argv));
            return;
          }

          if (executor_config.ignore !== undefined && (_.findIndex(executor_config.ignore, function(v) { return (v == _.head(argv)); }) !== (-1))) {
            /*
             * If the ignore array exists, ignore this command if it exists in the array
             *
             * TODO: regex
             */
            return;
          }

          if (executor_config.accept !== undefined && (_.findIndex(executor_config.accept, function(v) { return (v == _.head(argv)); }) === (-1))) {
            /*
             * If the accept array exists, only execute command if it exists in this array
             *
             * TODO: regex
             */
            return;
          }

          try {

            var exe = "./bin/" + _.head(argv);

            var user_info = DarkIrc.parseUser(irc_message[1]);
            var env = _.clone(process.env);

            env.DARK_EXEC_SERVER_LABEL = json.server.label;
            env.DARK_EXEC_SERVER_SESSION = json.server.session;
            env.DARK_EXEC_SERVER_HOST = json.server.host;
            env.DARK_EXEC_SERVER_PORT = json.server.port;
            env.DARK_EXEC_SERVER_PROTOCOL = json.server.port;
            env.DARK_EXEC_IRC_USER = irc_message[1];
            env.DARK_EXEC_IRC_NICK = user_info.nick;
            env.DARK_EXEC_IRC_IDENT = user_info.ident;
            env.DARK_EXEC_IRC_HOST = user_info.host;
            env.DARK_EXEC_IRC_CHANNEL = irc_message[3];

            var cmd = cproc.spawn(exe, _.tail(argv), { cwd: commands, env: env });

            console.log("EXE", exe, "ARGV", _.tail(argv), "CWD", commands);

            cmd.stdout.on("data", function(data) {

              // filter out bad lines from the left & right
              var lines_ = _.split(data.toString(), "\n");
              var isBadChars = function(c) { return (c == "\r\n" || c == "\r" || c == "\n" || c === ""); };
              var lines = _.dropRightWhile(_.dropWhile(lines_, isBadChars), isBadChars);

              _.each(lines, function(value) {
                var privmsg = DarkIrc.prepare_reply_privmsg(irc_message, value);
                pub.publish(DarkKeys.mkRelayServer(json.server.label), JSON.stringify(DarkEvents.mkAuthoredEvent(json.server, DarkEvents.raw(0, privmsg))));
              });
            });
            cmd.stderr.on("data", function(data) {
              // filter out bad lines from the left & right
              var lines_ = _.split(data.toString(), "\n");
              var isBadChars = function(c) { return (c == "\r\n" || c == "\r" || c == "\n" || c === ""); };
              var lines = _.dropRightWhile(_.dropWhile(lines_, isBadChars), isBadChars);

              _.each(lines, function(value) {
                var privmsg = DarkIrc.prepare_reply_privmsg(irc_message, value);
                pub.publish(DarkKeys.mkRelayServer(json.server.label), JSON.stringify(DarkEvents.mkAuthoredEvent(json.server, DarkEvents.raw(0, privmsg))));
              });
            });
            cmd.on("error", function(err) {
              console.log(err);
            });
          } catch (err) {
            console.log("CATCH:", err);
          }
        } else if (dark_message === "darkness!?") {
          /* Every module which wishes to respond, does so */
          var privmsg = DarkIrc.prepare_reply_privmsg(irc_message, "executor: my prefix is " + executor_config.prefix);
          pub.publish(DarkKeys.mkRelayServer(json.server.label), JSON.stringify(DarkEvents.mkAuthoredEvent(json.server, DarkEvents.raw(0, privmsg))));
        }

        break;
      }

      default : {
        break;
      }

    }
  });

};



module.exports = {
  redisLoop: redisLoop
};

})();
