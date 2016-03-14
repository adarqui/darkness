package main

import (
  "math/rand"
)

func randRange(x, y int) int {
  return rand.Intn(y - x) + x
}
