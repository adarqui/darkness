package darkness_events

func RelayConnected() Event {
  return Event{
    EVENT_RELAY_CONNECTED,
    []byte{},
  }
}

func RelayDisconnected() Event {
  return Event{
    EVENT_RELAY_DISCONNECTED,
    []byte{},
  }
}

func RelayReceivedMessage(v []byte) Event {
  return Event{
    EVENT_RELAY_RECEIVED_MESSAGE,
    v,
  }
}

func TunnelConnected() Event {
  return Event{
    EVENT_TUNNEL_CONNECTED,
    []byte{},
  }
}

func TunnelDisconnected() Event {
  return Event{
    EVENT_TUNNEL_DISCONNECTED,
    []byte{},
  }
}

func TunnelSentMessage(v []byte) Event {
  return Event{
    EVENT_TUNNEL_SENT_MESSAGE,
    v,
  }
}
