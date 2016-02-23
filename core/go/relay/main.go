package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/log"
  "flag"
  "log"
  "sync"
)



func main() {

  flag.Parse()

  if flag_redis_config == "" || flag_relay_config == "" {
    usage()
  }

  darkness_log.InitLog()
  relay_config, err := darkness_config.ParseRelayConfig(flag_relay_config)
  if err != nil {
    log.Fatal(err)
  }

  redis_config_file, err := darkness_config.ParseRedisFileConfig(flag_redis_config)
  if err != nil {
    log.Fatal(err)
  }

  var wg sync.WaitGroup
  wg.Add(1)
  loop(redis_config_file.Redis, relay_config)
  wg.Wait()
}
