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
  Config darkness_config.IrcConnectedConfig
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
  state := makeState(conf)
  state.redisPubLoop(conf)
  state.redisSubLoop(conf)
  wg.Wait()
}



func makeState(conf darkness_config.IrcConnectedConfig) State {
  return State{
    make(chan darkness_events.AuthoredEvent),
    make(chan darkness_events.AuthoredEvent),
    conf,
  }
}



func (state State) redisPubLoop(irc_connected_config darkness_config.IrcConnectedConfig) {
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
        state.redisPublishLoop(&wg, rw)
        wg.Wait()
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



func (state State) redisSubLoop(irc_connected_config darkness_config.IrcConnectedConfig) {
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
        state.redisSubscribeLoop(&wg, rw)
        wg.Wait()
      }
      time.Sleep(1 * time.Second)
    }
  }()
}



/*
 * Publish events to the relay
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

      n_pub, err_pub := rw.Publish(darkness_keys.MkRelay(), json)
      log.Println(n_pub, err_pub)
    }
  }()
}



/*
 * Subscribe to events that we received from redis
 */
func (state State) redisSubscribeLoop(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter) {
  go func() {
    defer wg.Done()
    _, _, err := rw.Subscribe(darkness_keys.MkEvent())
    if err != nil {
      return
    }
    for {
      response_key, response_message, err := rw.SubscribeMessage(darkness_keys.MkEvent())
      if err != nil {
        return
      }
      log.Println("RESPONSE:", string(response_key), string(response_message), err)
      switch string(response_key) {
        case "dark:event":
          state.handleDarkEvent(response_message)
        default:
          break
      }
    }
  }()
}



func (state State) handleDarkEvent(response_message []byte) {
  var ev darkness_events.AuthoredEvent
  var err error
  err = json.Unmarshal(response_message, &ev)
  if err != nil {
    log.Println("handleDarkEvent", err)
    return
  }
  log.Println("dark event", ev)
  /*
   * look for the label within the config in State, if found, publish some stuff to the relay to forward to the irc server
   */
  v, ok := state.Config.Labels[ev.Server.Label]
  if !ok {
    log.Println("not found")
  }
  log.Println(v)
  // publish nick
  /*
  json_nick, err := json.Marshal(darkness_events.Raw(0, []byte("NICK test\r\n")))
  if err != nil {
    return
  }
  */
  state.WireRecvCh <- darkness_events.AuthoredEvent{ev.Server, darkness_events.Raw(0, []byte("NICK test\r\n"))}

  // publish user
  state.WireRecvCh <- darkness_events.AuthoredEvent{ev.Server, darkness_events.Raw(0, []byte("USER test 0 * :Real Name\r\n"))}
}
