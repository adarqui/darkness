package darkness_redis

import (
  "bufio"
)



type RESP_Writer struct {
  *bufio.Writer
}



type RESP_Reader struct {
  *bufio.Reader
}



type RESP_ReadWriter struct {
  *bufio.Reader
  *bufio.Writer
}
