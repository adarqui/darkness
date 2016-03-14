package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
)



func makeState(redis_config darkness_config.RedisConfig, connected_config darkness_config.IrcConnectedConfig) State {
  return State{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
    redis_config,
    connected_config,
  }
}
