package main

import (
  "github.com/adarqui/darkness/core/go/lib/events"
)



func makePubState() PubState {
  return PubState{
    make(chan darkness_events.AuthoredEvent),
  }
}



func makeConnectionState() ConnectionState {
  return ConnectionState{
    make(chan darkness_events.AuthoredEvent),
//    make(chan darkness_events.AuthoredEvent),
  }
}



func makeServerState(pub_state PubState) ServerState {
  return ServerState{
    pub_state,
    makeConnectionState(),
  }
}
