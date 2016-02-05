package main

import (
  "github.com/adarqui/darkness/core/go/lib/events"
)



type PubState struct {
  RedisPubCh chan darkness_events.AuthoredEvent
}



type ConnectionState struct {
  WireSendCh chan darkness_events.AuthoredEvent
  WireRecvCh chan darkness_events.AuthoredEvent
}



type ServerState struct {
  Pub  PubState
  Conn ConnectionState
}
