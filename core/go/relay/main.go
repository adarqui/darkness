package main

import (
  "github.com/adarqui/darkness/core/go/lib/config"
  "os"
  "log"
  "sync"
)



func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  conf, err := darkness_config.ParseRelayConfig(args[1])
  if err != nil {
    log.Fatal(err)
  }

  log.Println(conf)
  var wg sync.WaitGroup
  wg.Add(1)
  loop(conf)
  wg.Wait()
}
