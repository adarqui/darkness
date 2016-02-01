package darkness_events

import (
  "github.com/adarqui/darkness/core/go/lib/config"
)



/*
const (
  EVENT_NOP                    = iota
  EVENT_DIE                    = iota
  EVENT_RELAY_CONNECTED        = iota
  EVENT_RELAY_DISCONNECTED     = iota
  EVENT_TUNNEL_CONNECTED       = iota
  EVENT_TUNNEL_DISCONNECTED    = iota
  EVENT_RELAY_RECEIVED_MESSAGE = iota
  EVENT_TUNNEL_SENT_MESSAGE    = iota
)
*/



const (
  EVENT_NOP                    = "nop"
  EVENT_DIE                    = "die"
  EVENT_RELAY_CONNECTED        = "relay_connected"
  EVENT_RELAY_DISCONNECTED     = "relay_disconnected"
  EVENT_TUNNEL_CONNECTED       = "tunnel_connected"
  EVENT_TUNNEL_DISCONNECTED    = "tunnel_disconnected"
  EVENT_RELAY_RECEIVED_MESSAGE = "relay_received_message"
  EVENT_TUNNEL_SENT_MESSAGE    = "tunnel_sent_message"
)



type Event struct {
  Id      int64  `json:"id"`
  Type    string `json:"type"`
  Payload []byte `json:"payload"`
}



type AuthoredEvent struct {
  Server darkness_config.ServerConfig
  Event Event
}
