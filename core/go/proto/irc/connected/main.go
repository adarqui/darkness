package main

import (
  "encoding/json"
  "fmt"
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
  "github.com/adarqui/darkness/core/go/lib/keys"
  "github.com/adarqui/darkness/core/go/lib/redis"
  "github.com/satori/go.uuid"
  "log"
  "net"
  "os"
  "sync"
  "time"
)



type Channels struct {
  WireSendCh chan darkness_events.AuthoredEvent
  WireRecvCh chan darkness_events.AuthoredEvent
}



func usage() {
  fmt.Println("usage: ./dark_go_irc_connected <config_file>")
  os.Exit(1)
}



func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  conf, err := darkness_config.ParseIrcConnectedConfig(args[1])
  if err != nil {
    log.Fatal(err)
  }
  uuid := uuid.NewV4()
  log.Println(uuid)

  log.Println(conf)
  var wg sync.WaitGroup
  wg.Add(1)
  channels := makeChannels()
  channels.redisPubLoop(conf)
  channels.redisSubLoop(conf)
  wg.Wait()
}



func makeChannels() Channels {
  return Channels{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
  }
}



func (channels Channels) redisPubLoop(irc_connected_config darkness_config.IrcConnectedConfig) {
  go func() {
    for {
      fmt.Println("redis loop")
      // temporary, refactor
      redis := irc_connected_config.Redis
      log.Println(redis)
      addr := fmt.Sprintf("%s:%d", redis.RedisHost, redis.RedisPort)
      conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
      if conn_err != nil {
      } else {

        rw := darkness_redis.NewReadWriter(conn, conn)
        log.Println("redis: connected")

        var wg sync.WaitGroup
        wg.Add(1)
        channels.redisPublishLoop(&wg, rw)
        wg.Wait()
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



func (channels Channels) redisSubLoop(irc_connected_config darkness_config.IrcConnectedConfig) {
  go func() {
    for {
      fmt.Println("redis loop")
      // temporary, refactor
      redis := irc_connected_config.Redis
      log.Println(redis)
      addr := fmt.Sprintf("%s:%d", redis.RedisHost, redis.RedisPort)
      conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
      if conn_err != nil {
      } else {

        rw := darkness_redis.NewReadWriter(conn, conn)

        log.Println("redis: connected")

        var wg sync.WaitGroup
        wg.Add(1)
        channels.redisSubscribeLoop(&wg, rw)
        wg.Wait()
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



/*
 * Publish events that we receive from the irc server
 */
func (channels Channels) redisPublishLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter) {
  go func() {
    defer wg.Done()
    for message := range channels.WireRecvCh {
      log.Println("redisPublishLoop", message)

      n_incr, err_incr := rw.Incr(darkness_keys.MkCounter(message.Server.Label))
      log.Println(n_incr, err_incr)
      if err_incr != nil {
        log.Println("redisPublishLoop: error: darkness_redis.Incr")
        return
      }
      message.PatchId(n_incr)

      json, err := json.Marshal(message)
      if err != nil {
        continue
      }
      n_pub, err_pub := rw.Publish(darkness_keys.MkEvent(), json)
      log.Println(n_pub, err_pub)
    }
  }()
}



/*
 * Subscribe to events that we received from redis
 */
func (channels Channels) redisSubscribeLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter) {
  go func() {
    defer wg.Done()
    n, buf, err := rw.Subscribe(darkness_keys.MkEvent())
    log.Println(n, buf, err)
    for {
//      buf := make([]byte, 512)
//      n, err := conn.Read(buf)
      response, err := rw.SubscribeMessage(darkness_keys.MkEvent())
      log.Println(response, err)
    }
  }()
}
