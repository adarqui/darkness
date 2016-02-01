package darkness_redis

import (
  "fmt"
  "net"
  "log"
  "errors"
  "strconv"
  "bytes"
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
 * Subscribe
 */
func Subscribe(conn net.Conn, key string) (int, []byte, error) {
  /*
     *2
     $9
     publish
     subscribe
     $4
     bleh
  */

  // TODO: need to retrieve all bytes not just 512 byte chunks
  buf := make([]byte, 512)

  request := fmt.Sprintf("*2\r\n$9\r\nSUBSCRIBE\r\n$%d\r\n%s\r\n", len(key), key)
  conn.Write([]byte(request))

  n, err := conn.Read(buf);
  if err != nil {
    return 0, nil, err
  }

  log.Println(string(buf))

  return n, buf, nil
}



/*
 * SubscribeMessage
 */
func SubscribeMessage(conn net.Conn, key string) ([]byte, error) {
  buf := make([]byte, 512)

  _, err := conn.Read(buf)
  if err != nil {
    return nil, err
  }

  /*
   *3
   $7
   message
   $10
   dark:event
   $133
   <message>
   */

   log.Println(string(buf))

   if bytes.HasPrefix(buf, []byte("*3\r\n$7\r\nmessage\r\n")) == false {
     return nil, errors.New("unknown response")
   }

   message_len, err := strconv.ParseInt(string(bytes.Trim(buf[16:], "\r\n")), 10, 64)
   if err != nil {
     return nil, err
   }

   log.Println(message_len)
   return nil, nil
}



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
