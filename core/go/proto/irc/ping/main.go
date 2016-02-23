package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/log"
  "log"
  "flag"
  "sync"
)



func main() {

  flag.Parse()

  if flag_redis_config == "" {
    usage()
  }

  redis_config, err := darkness_config.ParseRedisFileConfig(flag_redis_config)
  if err != nil {
    log.Fatal(err)
  }

  darkness_log.InitLog()

  var wg sync.WaitGroup
  wg.Add(1)
  state := makeState(redis_config.Redis)
  go state.redisPubLoop(redis_config.Redis)
  go state.redisSubLoop(redis_config.Redis)
  wg.Wait()
}
