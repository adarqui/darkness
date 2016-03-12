(function() {
"use strict";

// http://www.mybuddymichael.com/writings/a-regular-expression-for-irc-messages.html
var irc_regex = /^(?:[:](\S+) )?(\S+)(?: (?!:)(.+?))?(?: [:](.+))?$/;
var irc_user_regex = /([^!].*)![~]?([^@].*)@(.*)/;



var parse = function(message) {
  var results = irc_regex.exec(message);
  return results;
};



var parseUser = function(message) {
  // user!ident@ip
  var results = irc_user_regex.exec(message);
  if (results.length === 4) {
    return {
      nick: results[1],
      ident: results[2],
      host: results[3]
    };
  } else {
    return {
      nick: "unknown",
      ident: "unknown",
      host: "unknown"
    };
  }
};



/*
 * remove crlf
 */
var clean = function(message) {
  return message.replace(/[\r\n]/g, '');
};



var prepare_reply_privmsg = function(irc_message, reply) {
  return ("PRIVMSG " + irc_message[3] + " :" + reply + "\r\n");
};



module.exports = {
  parse: parse,
  parseUser: parseUser,
  clean: clean,
  prepare_reply_privmsg: prepare_reply_privmsg
};



})();
