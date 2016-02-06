package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "log"
//  "github.com/satori/go.uuid"
  "os"
  "sync"
)



func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  conf, err := darkness_config.ParseRedisFileConfig(args[1])
  if err != nil {
    log.Fatal(err)
  }

//  uuid := uuid.NewV4()

  var wg sync.WaitGroup
  wg.Add(1)
  state := makeState(conf.Redis)
  go state.redisPubLoop(conf.Redis)
  go state.redisSubLoop(conf.Redis)
  wg.Wait()
}
