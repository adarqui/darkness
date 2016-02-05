package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/log"
  "log"
  "os"
  "sync"
)



func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  darkness_log.InitLog()
  conf, err := darkness_config.ParseRelayConfig(args[1])
  if err != nil {
    log.Fatal(err)
  }

  var wg sync.WaitGroup
  wg.Add(1)
  loop(conf)
  wg.Wait()
}
