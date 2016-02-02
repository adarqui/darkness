package darkness_redis

import (
  "fmt"
//  "log"
//  "errors"
  "strconv"
)



/*
 * Incr
 */
func (rw *RESP_ReadWriter) Incr(key string) (int64, error) {

  request := fmt.Sprintf("*2\r\n$4\r\nINCR\r\n$%d\r\n%s\r\n", len(key), key)
  rw.Write([]byte(request))
  rw.Flush()

  _, err := rw.ReadBytes(':')
  if err != nil {
    return 0, err
  }

  response, _, err := rw.ReadLine()
  if err != nil {
    return 0, err
  }

  response_int, err := strconv.ParseInt(string(response), 10, 64)
  if err != nil {
    return 0, err
  }

  return response_int, nil
}
