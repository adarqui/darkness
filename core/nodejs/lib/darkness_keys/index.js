(function() {
"use strict";



var DARK_COUNTER      = "dark:counter";
var DARK_EVENT        = "dark:event";
var DARK_RELAY        = "dark:relay";
var DARK_INTERP_REPLY = "dark:interp:reply";



/*
 * DARK_COUNTER:<label>
 */
var mkCounter = function(key) {
  return DARK_COUNTER + ":" + key;
};



/*
 * DARK_EVENT
 */
var mkEvent = function() {
  return DARK_EVENT;
};



/*
 * DARK_RELAY
 */
var mkRelay = function() {
  return DARK_RELAY;
};



/*
* DARK_RELAY:<SERVER>
 */
var mkRelayServer = function(key) {
  return DARK_RELAY + ":" + key;
};



module.exports = {
  DARK_COUNTER      : DARK_COUNTER,
  DARK_EVENT        : DARK_EVENT,
  DARK_RELAY        : DARK_RELAY,
  DARK_INTERP_REPLY : DARK_INTERP_RELAY,

  mkCounter     : mkCounter,
  mkEvent       : mkEvent,
  mkRelay       : mkRelay,
  mkRelayServer : mkRelayServer
};



})();
