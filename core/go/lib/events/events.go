package darkness_events

func FrontConnected() Event {
  return Event{
    EVENT_FRONT_CONNECTED,
    []byte{},
  }
}

func FrontDisconnected() Event {
  return Event{
    EVENT_FRONT_DISCONNECTED,
    []byte{},
  }
}

func FrontReceivedMessage(v []byte) Event {
  return Event{
    EVENT_FRONT_RECEIVED_MESSAGE,
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
