package main

import (
//  "bufio"
//  "bytes"
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



/*
type AuthoredEvent struct {
  Server darkness_config.ServerConfig
  Event darkness_events.Event
}
*/



func usage() {
  fmt.Println("usage: ./dark_go_relay <config_file>")
  os.Exit(1)
}



func main() {
  args := os.Args
  if len(args) < 2 {
    usage()
  }
  conf, err := darkness_config.ParseRelayConfig(args[1])
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
  channels.ircLoop(conf)
  wg.Wait()
}



func makeChannels() Channels {
  return Channels{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
  }
}



func (channels Channels) ircLoop(relay_config darkness_config.RelayConfig) {
  go func() {
    for {
      fmt.Println("irc loop")
      // temporary, refactor
      for _, server := range relay_config.Servers {
        log.Println(server)
        addr := fmt.Sprintf("%s:%d", server.Host, server.Port)
        conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
        if conn_err != nil {
        } else {

          rw := darkness_redis.NewReadWriter(conn, conn)

          channels.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayConnected(0)}

          var wg sync.WaitGroup
          wg.Add(1)
          fmt.Println("connected")
          channels.ircLoopSend(&wg, rw, server)
          channels.ircLoopRecv(&wg, rw, server)
          wg.Wait()
          log.Println("ircLoop: after wg.Wait()")

          channels.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayDisconnected(0)}

        }
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



func (channels Channels) ircLoopSend(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  go func() {
    defer wg.Done()
    for {
      event := <-channels.WireSendCh
      log.Println(event)
    }
  }()
}



func (channels Channels) ircLoopRecv(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  go func() {
    defer wg.Done()
    buf := make([]byte, 512)
    for {
      /*
      n, read_err := conn.Read(buf)
      //   n, read_err := bufio.NewReader(conn).Read(buf)
      if read_err != nil {
        log.Println("ircLoopRecv: read broken")
        break
      }
      log.Printf("irc: %d %s\n", n, buf)
      */
      read_n, read_err := rw.Read(buf)
      if read_err != nil {
        log.Println("ircLoopRecv: read broken")
        break
      }
      log.Println("ircLoopRecv: %d %s\n", read_n, buf)
      channels.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayReceivedMessage(0, buf)}
    }
  }()
}



func (channels Channels) redisPubLoop(relay_config darkness_config.RelayConfig) {
  go func() {
    for {
      fmt.Println("redis loop")
      // temporary, refactor
      redis := relay_config.Redis
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



func (channels Channels) redisSubLoop(relay_config darkness_config.RelayConfig) {
  go func() {
    for {
      fmt.Println("redis loop")
      // temporary, refactor
      redis := relay_config.Redis
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
 * Subscribe to events that we received from redis, which are generated by tunnels
 */
func (channels Channels) redisSubscribeLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter) {
  go func() {
    defer wg.Done()
    buf := make([]byte, 512)
    for {
      /*
      n, read_err := bufio.NewReader(conn).Read(buf)
      if read_err != nil {
        break
      }
      log.Printf("redis: %d %s\n", n, buf)
      */
      read_n, read_err := rw.Read(buf)
      if read_err != nil {
        break
      }
      log.Printf("redis: %d %s\n", read_n, buf)
      //   channels.WireRecvCh <- darkness_events.TunnelSentMessage(buf)
    }
  }()
}
