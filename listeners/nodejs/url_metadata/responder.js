(function() {
"use strict";


var
  Redis      = require("redis"),
  DarkEvents = require("darkness_events"),
  DarkKeys   = require("darkness_keys"),
  DarkIrc    = require("darkness_irc"),
  Inspect    = require("node-metainspector"),
  _          = require("lodash")
  ;



// http://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
// var url_regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/g;
// my boi meder: https://github.com/medero/fedor/blob/master/vendor/parser/parser.js#L78
var url_regex = /(https?:[;\/?\\@&=+$,\[\]A-Za-z0-9\-_\.\!\~\*\'\(\)%][\;\/\?\:\@\&\=\+\$\,\[\]A-Za-z0-9\-_\.\!\~\*\'\(\)%#]*|[KZ]:\\*.*\w+)/g;



var redisLoop = function(o) {

  var conf = o.config;

  var redis_url = "redis://" + conf.redis.host + ":" + conf.redis.port;



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

        var results = url_regex.exec(dark_message);
        if (results === null) {
          break;
        }

        var client = new Inspect(results[0], { timeout: 10000 });

        client.on("fetch", function(){
          var title;
          // flaccid
          if (client.title !== null && client.title !== undefined && client.title != "undefined") {
            title = client.title;
            if (client.description !== null && client.description !== undefined && client.description !== client.title && client.description != "undefined") {
              title = title + " : " + client.description;
            }
          } else if (client.description !== null && client.description !== undefined && client.description != "undefined") {
            title = client.description;
          } else {
            return;
          }
          title = title.replace(/\s\s+/g, ' ').replace(/\r?\n|\r/g, '').trim();
          var privmsg = DarkIrc.prepare_reply_privmsg(irc_message, title);
          pub.publish(DarkKeys.mkRelayServer(json.server.label), JSON.stringify(DarkEvents.mkAuthoredEvent(json.server, DarkEvents.raw(0, privmsg))));
        });

        client.on("error", function(err){
          console.log("error", err);
        });

        client.fetch();

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
