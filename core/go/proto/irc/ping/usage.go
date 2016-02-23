package main

import (
  "flag"
  "fmt"
  "os"
)


var flag_redis_config string;



func init() {

  const (
    redis_help = "specifies redis config file"
  )

  flag.StringVar(&flag_redis_config, "r", "", redis_help)
  flag.StringVar(&flag_redis_config, "redis-config", "", redis_help)
}



func usage() {
  fmt.Println("usage: ./dark_go_irc_connected [-r|--redis-config <redis_config_file>]")
  os.Exit(1)
}
