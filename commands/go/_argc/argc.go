package main

import (
  "os"
  "fmt"
)

func main() {
  fmt.Printf("%d\n", (len(os.Args)-1))
}
