package darkness_redis

import (
  "fmt"
  "net"
)

func Publish(conn net.Conn, channel string, payload []byte) {
  /*
     $7
     publish
     $4
     bleh
     $4
     poop
  */
  v := fmt.Sprintf("*3\r\n$7\r\nPUBLISH\r\n$%d\r\n%s\r\n$%d\r\n%s\r\n", len(channel), channel, len(payload), string(payload))
  conn.Write([]byte(v))
}
