package darkness_events

const (
  EVENT_NOP                    = iota
  EVENT_DIE                    = iota
  EVENT_RELAY_CONNECTED        = iota
  EVENT_RELAY_DISCONNECTED     = iota
  EVENT_TUNNEL_CONNECTED       = iota
  EVENT_TUNNEL_DISCONNECTED    = iota
  EVENT_RELAY_RECEIVED_MESSAGE = iota
  EVENT_TUNNEL_SENT_MESSAGE    = iota
)

type Event struct {
  Type    int    `json:"type"`
  Payload []byte `json:"payload"`
}
