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
  "sync"
  "time"
)



func loop(relay_config darkness_config.RelayConfig) {
  /*
   * Our redis publish loop runs in it's own go routine.
   * Anything it receives will be published to redis.
   */
  pub_state := makePubState()
  go pub_state.redisPubLoop(relay_config)

  /*
   * Create a bunch of tunnels to servers.
   * Relay messages from servers to redis (^^redisPubLoop)
   * Relay messages from redis to the appropriate server.
   */
  for _, server := range relay_config.Servers {
    server_state := makeServerState(pub_state)
    server_state.loopServer(relay_config, server)
  }
}



func (server_state ServerState) loopServer(relay_config darkness_config.RelayConfig, server_config darkness_config.ServerConfig) {
  log.Println("connecting to", server_config)
  go server_state.ircLoop(server_config)
  go server_state.Conn.redisSubLoop(relay_config, server_config)
}



func (server_state ServerState) ircLoop(server darkness_config.ServerConfig) {
  for {
    fmt.Println("irc loop")
    // temporary, refactor
    log.Println(server)
    addr := fmt.Sprintf("%s:%d", server.Host, server.Port)
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {

      uuid := uuid.NewV4()

      server.Session = fmt.Sprintf("%s",uuid)

      rw := darkness_redis.NewReadWriter(conn, conn)

      server_state.Pub.RedisPubCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayConnected(0)}

      var wg sync.WaitGroup
      wg.Add(1)
      fmt.Println("connected")
      go server_state.ircLoopSend(&wg, rw, server)
      go server_state.ircLoopRecv(&wg, rw, server)
//          state.WireSendCh = make(chan darkness_events.AuthoredEvent, 1)
//          state.redisSubLoop(relay_config, server)
      wg.Wait()
//          state.WireSendCh <- darkness_events.AuthoredEvent{server, darkness_events.MkDie()}
      log.Println("ircLoop: after wg.Wait()")

      server_state.Conn.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayDisconnected(0)}
      log.Println("after disconnected event")
    }
    time.Sleep(1 * time.Second)
  }
}



func (server_state ServerState) ircLoopSend(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  defer wg.Done()
  for {
    event := <-server_state.Conn.WireSendCh

    /*
    if event.Event.Type == "die" {
      return
    }
    */

    log.Println("EVENT", event)
    message := event.Event.Payload
    log.Println("writing", string(message))
    rw.Write(message)
    rw.Flush()
  }
}



func (server_state ServerState) ircLoopRecv(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
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
    server_state.Conn.WireRecvCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayReceivedMessage(0, buf)}
  }
}



func (pub_state PubState) redisPubLoop(relay_config darkness_config.RelayConfig) {
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

      pub_state.redisPublishLoop(rw)
      log.Println("redisPublishLoop: after wg.Wait()")
    }
    time.Sleep(1 * time.Second)
  }
}



/*
 * Publish events that we receive from the irc server
 */
func (pub_state PubState) redisPublishLoop(rw *darkness_redis.RESP_ReadWriter) {
  for message := range pub_state.RedisPubCh {
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
}



func (conn_state ConnectionState) redisSubLoop(relay_config darkness_config.RelayConfig, server darkness_config.ServerConfig) {
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
      conn_state.redisSubscribeLoop(rw, server)
    }
    time.Sleep(1 * time.Second)
  }
}



/*
 * Subscribe to events that we received from redis, which are generated by tunnels
 */
func (conn_state ConnectionState) redisSubscribeLoop(rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
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
         conn_state.handleDarkRelay(response_message)
       default:
         break
     }
   }
}



func (conn_state ConnectionState) handleDarkRelay(response_message []byte) {
  var ev darkness_events.AuthoredEvent
  var err error
  err = json.Unmarshal(response_message, &ev)
  if err != nil {
    log.Println("handleDarkRelay", err)
    return
  }
  log.Println("dark event", ev, string(ev.Event.Payload))
  conn_state.WireSendCh <- ev
//  pub_state.WireSendCh <- ev
}
