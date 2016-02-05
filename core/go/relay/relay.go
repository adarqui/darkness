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



type State struct {
  WireSendCh chan darkness_events.AuthoredEvent
  WireRecvCh chan darkness_events.AuthoredEvent
}



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

/*
  uuid := uuid.NewV4()
  log.Println(uuid)
*/

  log.Println(conf)
  var wg sync.WaitGroup
  wg.Add(1)
  state := makeState()
  state.redisPubLoop(conf)
//  state.redisSubLoop(conf)
  state.ircLoop(conf)
  wg.Wait()
}



func makeState() State {
  return State{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
  }
}



func (state State) ircLoop(relay_config darkness_config.RelayConfig) {
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

          uuid := uuid.NewV4()

          server.Session = fmt.Sprintf("%s",uuid)

          rw := darkness_redis.NewReadWriter(conn, conn)

          state.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayConnected(0)}

          var wg sync.WaitGroup
          wg.Add(1)
          fmt.Println("connected")
          state.ircLoopSend(&wg, rw, server)
          state.ircLoopRecv(&wg, rw, server)
          state.redisSubLoop(relay_config, server)
          wg.Wait()
          log.Println("ircLoop: after wg.Wait()")

          state.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayDisconnected(0)}
          log.Println("after disconnected event")

        }
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



func (state State) ircLoopSend(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  go func() {
    defer wg.Done()
    for {
      event := <-state.WireSendCh
      log.Println("EVENT", event)
      message := event.Event.Payload
      log.Println("writing", string(message))
      rw.Write(message)
      rw.Flush()
    }
  }()
}



func (state State) ircLoopRecv(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
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
      state.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayReceivedMessage(0, buf)}
    }
  }()
}



func (state State) redisPubLoop(relay_config darkness_config.RelayConfig) {
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
        state.redisPublishLoop(&wg, rw)
        wg.Wait()
        log.Println("redisPublishLoop: after wg.Wait()")
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



func (state State) redisSubLoop(relay_config darkness_config.RelayConfig, server darkness_config.ServerConfig) {
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
        state.redisSubscribeLoop(&wg, rw, server)
        wg.Wait()
        log.Println("redisSubLoop: after wg.Wait()")
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



/*
 * Publish events that we receive from the irc server
 */
func (state State) redisPublishLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter) {

  go func() {
    defer wg.Done()
    for message := range state.WireRecvCh {
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
func (state State) redisSubscribeLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
   go func() {
     defer wg.Done()
     _, _, err := rw.Subscribe(darkness_keys.MkRelayServer(server.Label))
     if err != nil {
       return
     }
     for {
       response_key, response_message, err := rw.SubscribeMessage(darkness_keys.MkRelayServer(server.Label))
       if err != nil {
         return
       }
       log.Println("RESPONSE:", string(response_key), string(response_message), err)
       switch string(response_key) {
         case (darkness_keys.MkRelayServer(server.Label)):
           state.handleDarkRelay(response_message)
         default:
           break
       }
     }
   }()
}



func (state State) handleDarkRelay(response_message []byte) {
  var ev darkness_events.AuthoredEvent
  var err error
  err = json.Unmarshal(response_message, &ev)
  if err != nil {
    log.Println("handleDarkRelay", err)
    return
  }
  log.Println("dark event", ev, string(ev.Event.Payload))
  state.WireSendCh <- ev
}
