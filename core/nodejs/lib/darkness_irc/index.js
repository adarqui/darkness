(function() {
"use strict";

// http://www.mybuddymichael.com/writings/a-regular-expression-for-irc-messages.html
var irc_regex = /^(?:[:](\S+) )?(\S+)(?: (?!:)(.+?))?(?: [:](.+))?$/;



var parse = function(message) {
  var results = irc_regex.exec(message);
  return results;
};



/*
 * remove crlf
 */
var clean = function(message) {
  return message.replace(/[\r\n]/g, '');
};



module.exports = {
  parse: parse,
  clean: clean
};

})();
