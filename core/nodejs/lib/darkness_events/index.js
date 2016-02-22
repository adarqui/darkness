(function() {
"use strict";



var exports = module.exports = {};



exports.EVENT_NOP                    = "nop";
exports.EVENT_DIE                    = "die";
exports.EVENT_RELAY_CONNECTED        = "relay_connected";
exports.EVENT_RELAY_DISCONNECTED     = "relay_disconnected";
exports.EVENT_TUNNEL_CONNECTED       = "tunnel_connected";
exports.EVENT_TUNNEL_DISCONNECTED    = "tunnel_disconnected";
exports.EVENT_RELAY_RECEIVED_MESSAGE = "relay_received_message";
exports.EVENT_TUNNEL_SENT_MESSAGE    = "tunnel_sent_message";
exports.EVENT_RAW                    = "raw";



exports.Event = {
  "id": 0,
  "type": "",
  "payload" : []
};



exports.AuthoredEvent = {
  "server": {},
  "event": {}
};



exports.mkEvent = function(id, type, payload) {
  return {
    "id": id,
    "type": type,
    "payload": payload
  };
};



exports.mkAuthoredEvent = function(server, event) {
  return {
    "server": server,
    "event": event
  };
};



exports.nop = function() {
  return mkEvent(0, EVENT_NOP, {});
};



exports.die = function() {
  return mkEvent(0, EVENT_DIE, {});
};



})();
