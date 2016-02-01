package darkness_redis

import (
  "fmt"
  "net"
  "log"
)



/*
 * Publish
 */
func Publish(conn net.Conn, key string, payload []byte) (int, error) {
  /*
     *3
     $7
     publish
     $4
     bleh
     $4
     poop
  */
  buf := make([]byte, 512)

  request := fmt.Sprintf("*3\r\n$7\r\nPUBLISH\r\n$%d\r\n%s\r\n$%d\r\n%s\r\n", len(key), key, len(payload), string(payload))
  conn.Write([]byte(request))

  n, err := conn.Read(buf);
  if err != nil {
    return 0, err
  }

  log.Println(string(buf))

  return n, nil
}



/*
 * Incr
 */
func Incr(conn net.Conn, key string) (int, error) {

  buf := make([]byte, 512)

  request := fmt.Sprintf("*2\r\n$4\r\nINCR\r\n$%d\r\n%s\r\n", len(key), key)
  conn.Write([]byte(request))

  n, err := conn.Read(buf)
  if err != nil {
    return 0, err
  }

  log.Println(string(buf))

  return n, nil
}
