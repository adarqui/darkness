package darkness_events

func FrontConnected() Event {
  return Event {
    EVENT_FRONT_CONNECTED,
    []byte{},
  }
}

func FrontReceivedMessage(v []byte) Event {
  return Event {
    EVENT_FRONT_RECEIVED_MESSAGE,
    v,
  }
}

func TunnelConnected() Event {
  return Event {
    EVENT_TUNNEL_CONNECTED,
    []byte{},
  }
}

func TunnelSentMessage(v []byte) Event {
  return Event {
    EVENT_TUNNEL_SENT_MESSAGE,
    v,
  }
}
