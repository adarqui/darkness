package darkness_events



func RelayConnected(id int64) Event {
  return Event{
    id,
    EVENT_RELAY_CONNECTED,
    []byte{},
  }
}



func RelayDisconnected(id int64) Event {
  return Event{
    id,
    EVENT_RELAY_DISCONNECTED,
    []byte{},
  }
}



func RelayReceivedMessage(id int64, v []byte) Event {
  return Event{
    id,
    EVENT_RELAY_RECEIVED_MESSAGE,
    v,
  }
}



func TunnelConnected(id int64) Event {
  return Event{
    id,
    EVENT_TUNNEL_CONNECTED,
    []byte{},
  }
}



func TunnelDisconnected(id int64) Event {
  return Event{
    id,
    EVENT_TUNNEL_DISCONNECTED,
    []byte{},
  }
}



func TunnelSentMessage(id int64, v []byte) Event {
  return Event{
    id,
    EVENT_TUNNEL_SENT_MESSAGE,
    v,
  }
}



func Raw(id int64, message []byte) Event {
  return Event{
    id,
    EVENT_RAW,
    message,
  }
}

