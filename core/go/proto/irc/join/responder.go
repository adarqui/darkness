package main

import (
  "encoding/json"
  "bytes"
  "fmt"
  "net"
  "strings"
  "time"
  "github.com/adarqui/darkness/core/go/lib/config"
  "github.com/adarqui/darkness/core/go/lib/events"
  "github.com/adarqui/darkness/core/go/lib/keys"
  "github.com/adarqui/darkness/core/go/lib/log"
  "github.com/adarqui/darkness/core/go/lib/redis"
)



func (state State) redisPubLoop(redis_config darkness_config.RedisConfig) {
  for {
    addr := fmt.Sprintf("%s:%d", redis_config.RedisHost, redis_config.RedisPort)
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {

      darkness_log.Log.Info("PUBLISHER: Connected to ", redis_config)

      rw := darkness_redis.NewReadWriter(conn, conn)

      state.redisPublishLoop(rw)

      darkness_log.Log.Info("PUBLISHER: Disconnected from ", redis_config)

    }
    time.Sleep(time.Second)
  }
}



func (state State) redisSubLoop(redis_config darkness_config.RedisConfig) {
  for {
    addr := fmt.Sprintf("%s:%d", redis_config.RedisHost, redis_config.RedisPort)
    conn, conn_err := net.DialTimeout("tcp", addr, 10*time.Second)
    if conn_err != nil {
    } else {

      darkness_log.Log.Info("SUBSCRIBER: Connected to ", redis_config)

      rw := darkness_redis.NewReadWriter(conn, conn)

      state.redisSubscribeLoop(rw)

      darkness_log.Log.Info("SUBSCRIBER: Disconnected from ", redis_config)
    }
    time.Sleep(time.Second)
  }
}



/*
 * Publish events to the relay
 */
func (state State) redisPublishLoop(rw *darkness_redis.RESP_ReadWriter) {
  for message := range state.WireRecvCh {

    darkness_log.Log.Info("PUBLISHER: Message received: ", message.Server, message.Event.Type, string(message.Event.Payload))

    n_incr, err_incr := rw.Incr(darkness_keys.MkCounter(message.Server.Label))
    if err_incr != nil {
      darkness_log.Log.Error("INCR error: ", err_incr)
      return
    }

    darkness_log.Log.Infof("INCR is now %d", n_incr)

    message.PatchId(n_incr)

    json, err := json.Marshal(message)
    if err != nil {
      darkness_log.Log.Error("Unable to marshal event")
      continue
    }

    _, err_pub := rw.Publish(darkness_keys.MkRelayServer(message.Server.Label), json)
    if err_pub != nil {
      darkness_log.Log.Errorf("PUBLISH error: %s", err_pub)
    }
  }
}



/*
 * Subscribe to events that we received from redis
 */
func (state State) redisSubscribeLoop(rw *darkness_redis.RESP_ReadWriter) {

  _, _, err := rw.Subscribe(darkness_keys.MkEvent())
  if err != nil {
    darkness_log.Log.Error("SUBSCRIBE error: ", err)
    return
  }

  for {

    response_key, response_message, err := rw.SubscribeMessage(darkness_keys.MkEvent())
    if err != nil {
      return
    }

    darkness_log.Log.Debug("SUBSCRIBER: Message received on key: ", string(response_key))

    switch string(response_key) {
      case darkness_keys.DARK_EVENT:
        state.handleDarkEvent(response_message)
      default:
        break
    }
  }
}



func (state State) handleDarkEvent(response_message []byte) {
  var ev darkness_events.AuthoredEvent
  var err error

  err = json.Unmarshal(response_message, &ev)
  if err != nil {
    darkness_log.Log.Error("Unable to unmarshal event: ", err)
    return
  }

  /*
   * Do we care about this event?
   */
  if ev.Event.Type != darkness_events.EVENT_RELAY_RECEIVED_MESSAGE {
    /* No. */
    return
  }

  // x!~x@ip KICK #darkness dark_2_a :kick_message
  irc_message := bytes.SplitN(ev.Event.Payload, []byte(" "), 5)

  if len(irc_message) != 5 {
    /* not intended for us */
    return
  }

  v, ok := state.ConnectedConfig.Labels[ev.Server.Label]
  if !ok {
    darkness_log.Log.Error("Label not found in connected config: ", ev.Server.Label)
    return
  }

  for _, nick := range(v.Nicks) {
    if strings.Compare(nick, string(irc_message[3])) == 0 {
      darkness_log.Log.Info("Responding to a KICK for: ", ev.Server, ", from: ", string(irc_message[0]))
      sleep_val := randRange(1, 5)
      print (sleep_val)
      time.Sleep(time.Duration(sleep_val)*time.Second)
      state.WireRecvCh <- darkness_events.AuthoredEvent{ev.Server, darkness_events.Raw(0, []byte(fmt.Sprintf("JOIN %s\r\n", irc_message[2])))}
      break
    }
  }

}
