package darkness_redis

import (
  "fmt"
//  "log"
//  "errors"
  "strconv"
//  "bytes"
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

//  log.Println(string(buf))

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

//  log.Println(string(buf))

  return n, buf, nil
}



/*
 * SubscribeMessage
 *
 * returns: key_name, message
 */
func (rw *RESP_ReadWriter) SubscribeMessage(key string) ([]byte, []byte, error) {

  /*
   *3
   $7
   message
   $10
   dark:event
   $133
   <message>
   */

   /*
      *3
    */
   _, _, err := rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   /*
      $7
      message
    */
   _, err = rw.ReadBytes('$')
   if err != nil {
     return nil, nil, err
   }

   len_static_string_s, _, err := rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   len_static_string, err := strconv.ParseInt(string(len_static_string_s), 10, 64)
   if err != nil {
     return nil, nil, err
   }
   static_string := make([]byte, len_static_string)
   _, err = rw.Read(static_string)
   if err != nil {
     return nil, nil, err
   }
   _, _, err = rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   /*
      $<key_length>
      $<key>
    */
   _, err = rw.ReadBytes('$')
   if err != nil {
     return nil, nil, err
   }

   len_sub_key_s, _, err := rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   len_sub_key, err := strconv.ParseInt(string(len_sub_key_s), 10, 64)
   if err != nil {
     return nil, nil, err
   }
   sub_key := make([]byte, len_sub_key)
   _, err = rw.Read(sub_key)
   if err != nil {
     return nil, nil, err
   }
   _, _, err = rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   /*
      $<message_length>
      $<message>
    */
   _, err = rw.ReadBytes('$')
   if err != nil {
     return nil, nil, err
   }
   len_message_s, _, err := rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }
   len_message, err := strconv.ParseInt(string(len_message_s), 10, 64)
   if err != nil {
     return nil, nil, err
   }
   message := make([]byte, len_message)
   _, err = rw.Read(message)
   if err != nil {
     return nil, nil, err
   }

   /*
      \r\n
    */
   _, _, err = rw.ReadLine()
   if err != nil {
     return nil, nil, err
   }

   return sub_key, message, nil
}
