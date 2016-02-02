package darkness_redis

import (
  "fmt"
  "log"
  "errors"
  "strconv"
  "bytes"
)



/*
 * Publish
 */
func (rw *RESP_ReadWriter) Publish(key string, payload []byte) (int, error) {
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
  rw.Write([]byte(request))
  rw.Flush()

  n, err := rw.Read(buf);
  if err != nil {
    return 0, err
  }

  log.Println(string(buf))

  return n, nil
}



/*
 * Subscribe
 */
func (rw *RESP_ReadWriter) Subscribe(key string) (int, []byte, error) {
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
  rw.Write([]byte(request))
  rw.Flush()

  n, err := rw.Read(buf);
  if err != nil {
    return 0, nil, err
  }

  log.Println(string(buf))

  return n, buf, nil
}



/*
 * SubscribeMessage
 */
func (rw *RESP_ReadWriter) SubscribeMessage(key string) ([]byte, error) {
  buf := make([]byte, 512)

  _, err := rw.Read(buf)
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
