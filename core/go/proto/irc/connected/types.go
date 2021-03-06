package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
)



type State struct {
  WireSendCh chan darkness_events.AuthoredEvent
  WireRecvCh chan darkness_events.AuthoredEvent
  RedisConfig darkness_config.RedisConfig
  ConnectedConfig darkness_config.IrcConnectedConfig
}
