package main

import (
  "os"
  "fmt"
  "log"
  "github.com/adarqui/darkness/core/go/lib/config"
)

func usage() {
  fmt.Println("usage: ./front <config_file>")
  os.Exit(1)
}

func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  conf, err := darkness_config.ParseConfig(args[1])
  if err != nil {
    log.Fatal(err)
  }
  log.Println(conf)
}
