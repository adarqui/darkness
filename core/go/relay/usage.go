package main

import (
  "flag"
  "fmt"
  "os"
)



var flag_redis_config string
var flag_relay_config string



func init() {

  const (
    redis_help = "specifies redis config file"
    relay_help = "specifies relay config file"
  )

  flag.StringVar(&flag_redis_config, "r", "", redis_help)
  flag.StringVar(&flag_redis_config, "redis-config", "", redis_help)

  flag.StringVar(&flag_relay_config, "c", "", relay_help)
  flag.StringVar(&flag_relay_config, "relay-config", "", relay_help)
}



func usage() {
  fmt.Println("usage: ./dark_go_relay [-r|--redis-config <redis_config_file>] [-c|--relay-config <relay_config_file>]")
  os.Exit(1)
}
