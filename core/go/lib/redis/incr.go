package darkness_redis

import (
  "fmt"
  "net"
  "log"
  "errors"
  "strconv"
)



/*
 * Incr
 */
func Incr(conn net.Conn, key string) (int64, error) {

  buf := make([]byte, 512)

  request := fmt.Sprintf("*2\r\n$4\r\nINCR\r\n$%d\r\n%s\r\n", len(key), key)
  conn.Write([]byte(request))

  n, err := conn.Read(buf)
  if err != nil {
    return 0, err
  }

  if n < 3 {
    return 0, errors.New("not enough bytes")
  }

  log.Println(string(buf))

  /*
   * 1:n-2 = :<value>\r\n
   */
  response, err := strconv.ParseInt(string(buf[1:(n-2)]), 10, 64)
  if err != nil {
    return 0, err
  }

  return response, nil
}
