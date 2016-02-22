(function() {
"use strict";



var EVENT_NOP                    = "nop";
var EVENT_DIE                    = "die";
var EVENT_RELAY_CONNECTED        = "relay_connected";
var EVENT_RELAY_DISCONNECTED     = "relay_disconnected";
var EVENT_TUNNEL_CONNECTED       = "tunnel_connected";
var EVENT_TUNNEL_DISCONNECTED    = "tunnel_disconnected";
var EVENT_RELAY_RECEIVED_MESSAGE = "relay_received_message";
var EVENT_TUNNEL_SENT_MESSAGE    = "tunnel_sent_message";
var EVENT_RAW                    = "raw";



var Event = {
  "id": 0,
  "type": "",
  "payload" : []
};



var AuthoredEvent = {
  "server": {},
  "event": {}
};



var mkEvent = function(id, type, payload) {
  return {
    "id": id,
    "type": type,
    "payload": payload
  };
};



var mkAuthoredEvent = function(server, event) {
  return {
    "server": server,
    "event": event
  };
};



var nop = function() {
  return mkEvent(0, EVENT_NOP, {});
};



var die = function() {
  return mkEvent(0, EVENT_DIE, {});
};



var relayConnected = function(id) {
  return mkEvent(id, EVENT_RELAY_CONNECTED, {});
};



var relayDisconnected = function(id) {
  return mkEvent(id, EVENT_RELAY_DISCONNECTED);
};



var relayReceivedMessage = function(id, v) {
  return mkEvent(id, EVENT_RELAY_RECEIVED_MESSAGE);
};



var tunnelConnected = function(id) {
  return mkEvent(id, EVENT_TUNNEL_CONNECTED);
};



var tunnelDisconnected = function(id) {
  return mkEvent(id, EVENT_TUNNEL_DISCONNECTED);
};



var tunnelSentMessage = function(id, v) {
  return mkTunnelSentMessage(id, EVENT_TUNNEL_SENT_MESSAGE, v);
};



var raw = function(id, message) {
  var message_b64 = new Buffer(message);
  return mkEvent(id, EVENT_RAW, message_b64.toString('base64'));
};



module.exports = {
  EVENT_NOP                    : EVENT_NOP,
  EVENT_DIE                    : EVENT_DIE,
  EVENT_RELAY_CONNECTED        : EVENT_RELAY_CONNECTED,
  EVENT_RELAY_DISCONNECTED     : EVENT_RELAY_DISCONNECTED,
  EVENT_TUNNEL_CONNECTED       : EVENT_TUNNEL_CONNECTED,
  EVENT_TUNNEL_DISCONNECTED    : EVENT_TUNNEL_DISCONNECTED,
  EVENT_RELAY_RECEIVED_MESSAGE : EVENT_RELAY_RECEIVED_MESSAGE,
  EVENT_TUNNEL_SENT_MESSAGE    : EVENT_TUNNEL_SENT_MESSAGE,
  EVENT_RAW                    : EVENT_RAW,

  Event         : Event,
  AuthoredEvent : AuthoredEvent,

  mkEvent         : mkEvent,
  mkAuthoredEvent : mkAuthoredEvent,

  nop                  : nop,
  die                  : die,
  relayConnected       : relayConnected,
  relayDisconnected    : relayDisconnected,
  relayReceivedMessage : relayReceivedMessage,
  tunnelConnected      : tunnelConnected,
  tunnelDisconnected   : tunnelDisconnected,
  tunnelSentMessage    : tunnelSentMessage,
  raw                  : raw
};



})();
