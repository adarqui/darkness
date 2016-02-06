package main

import (
  "encoding/json"
  "fmt"
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
  "github.com/adarqui/darkness/core/go/lib/keys"
  "github.com/adarqui/darkness/core/go/lib/log"
  "github.com/adarqui/darkness/core/go/lib/redis"
  "github.com/satori/go.uuid"
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
  darkness_log.Log.Info("Connecting to: ", server_config)
  go server_state.ircLoop(server_config)
  go server_state.Conn.redisSubLoop(relay_config, server_config)
}



func (server_state ServerState) ircLoop(server darkness_config.ServerConfig) {

  addr := fmt.Sprintf("%s:%d", server.Host, server.Port)

  for {
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {

      darkness_log.Log.Info("IRC: Connected to ", server)
      uuid := uuid.NewV4()

      server.Session = fmt.Sprintf("%s", uuid)

      rw := darkness_redis.NewReadWriter(conn, conn)

      server_state.Pub.RedisPubCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayConnected(0)}

      var wg sync.WaitGroup
      wg.Add(1)
      go server_state.ircLoopSend(&wg, rw, server)
      go server_state.ircLoopRecv(&wg, rw, server)
      wg.Wait()

      server_state.Conn.WireSendCh <- darkness_events.AuthoredEvent{server, darkness_events.Die()}

      server_state.Pub.RedisPubCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayDisconnected(0)}
      darkness_log.Log.Info("IRC: Disconnected from ", server)
    }
    time.Sleep(time.Second)
  }
}



func (server_state ServerState) ircLoopSend(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  for {
    event := <-server_state.Conn.WireSendCh

    if event.Event.Type == darkness_events.EVENT_DIE {
      darkness_log.Log.Info("IRC: Breaking connection")
      break
    }

    darkness_log.Log.Info("IRC: Sending message to irc server: ", event.Server, event.Event.Type, string(event.Event.Payload))

    message := event.Event.Payload

    _, write_err := rw.Write(message)
    if write_err != nil {
      darkness_log.Log.Error("IRC: Write error: ", write_err)
    }

    flush_err := rw.Flush()
    if flush_err != nil {
      darkness_log.Log.Error("IRC: Flush error: ", flush_err)
    }
  }
}



func (server_state ServerState) ircLoopRecv(wg *sync.WaitGroup, rw *darkness_redis.RESP_ReadWriter, server darkness_config.ServerConfig) {
  defer wg.Done()
  for {
    buf := make([]byte, 512)
    _, read_err := rw.Read(buf)
    if read_err != nil {
      darkness_log.Log.Error("IRC: connection broken: ", server)
      break
    }
    server_state.Pub.RedisPubCh <- darkness_events.AuthoredEvent{server, darkness_events.RelayReceivedMessage(0, buf)}
  }
}



func (pub_state PubState) redisPubLoop(relay_config darkness_config.RelayConfig) {

  darkness_log.Log.Info("Creating redis publisher")
  redis := relay_config.Redis
  addr := fmt.Sprintf("%s:%d", redis.RedisHost, redis.RedisPort)

  for {
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {
      darkness_log.Log.Info("PUBLISHER: Connected to redis: ", redis)

      rw := darkness_redis.NewReadWriter(conn, conn)

      pub_state.redisPublishLoop(rw)

      darkness_log.Log.Warning("PUBLISHER: Disconnected from redis")
    }
    time.Sleep(time.Second)
  }
}



/*
 * Publish events that we receive from the irc server
 */
func (pub_state PubState) redisPublishLoop(rw *darkness_redis.RESP_ReadWriter) {
  for message := range pub_state.RedisPubCh {

    darkness_log.Log.Debug("Message to be published to redis: ", message.Server, message.Event.Type, string(message.Event.Payload))

    n_incr, err_incr := rw.Incr(darkness_keys.MkCounter(message.Server.Label))
    if err_incr != nil {
      darkness_log.Log.Error("INCR failure: ", err_incr)
      return
    }

    darkness_log.Log.Infof("INCR is now %d", n_incr)

    message.PatchId(n_incr)

    json, err := json.Marshal(message)
    if err != nil {
      darkness_log.Log.Error("Unable to marshal event")
      continue
    }

    _, err_pub := rw.Publish(darkness_keys.MkEvent(), json)
    if err_pub != nil {
      darkness_log.Log.Errorf("PUBLISH error: %s", err_pub)
    }
  }
}



func (conn_state ConnectionState) redisSubLoop(relay_config darkness_config.RelayConfig, server darkness_config.ServerConfig) {

  redis := relay_config.Redis
  addr := fmt.Sprintf("%s:%d", redis.RedisHost, redis.RedisPort)

  for {
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {

      darkness_log.Log.Info("SUBSCRIBER: Connected to redis")

      rw := darkness_redis.NewReadWriter(conn, conn)
      conn_state.redisSubscribeLoop(rw, server)

      darkness_log.Log.Warning("SUBSCRIBER: Disconnected from redis")
    }
    time.Sleep(time.Second)
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
       darkness_log.Log.Error("SUBSCRIBER: Subscribe error: ", err)
       return
     }

     darkness_log.Log.Debugf("SUBSCRIBER: received message on %s, %s", response_key, response_message)

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
    darkness_log.Log.Error("Unable to unmarshal message to AuthoredEvent: ", err)
    return
  }

  darkness_log.Log.Debug("AuthoredEvent received: ", string(ev.Event.Payload))
  conn_state.WireSendCh <- ev
}
