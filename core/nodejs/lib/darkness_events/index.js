(function() {
"use strict";



var exports = module.exports = {};



exports.DARK_COUNTER = "dark:counter";
exports.DARK_EVENT   = "dark:event";
exports.DARK_RELAY   = "dark:relay";



/*
 * DARK_COUNTER:<label>
 */
exports.mkCounter = function(key) {
  return DARK_COUNTER + ":" + key;
};



/*
 * DARK_EVENT
 */
exports.mkEvent = function() {
  return DARK_EVENT;
};



/*
 * DARK_RELAY
 */
exports.mkRelay = function() {
  return DARK_RELAY;
};



/*
* DARK_RELAY:<SERVER>
 */
exports.mkRelayServer = function(key) {
  return DARK_RELAY + ":" + key;
};



})();
