package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
)



func makeState(conf darkness_config.RedisConfig) State {
  return State{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
    conf,
  }
}
