package darkness_redis

import (
  "io"
  "bufio"
)



func NewWriter(writer io.Writer) *RESP_Writer {
  return &RESP_Writer{
    Writer: bufio.NewWriter(writer),
  }
}



func NewReader(reader io.Reader) *RESP_Reader {
  return &RESP_Reader{
    Reader: bufio.NewReader(reader),
  }
}
