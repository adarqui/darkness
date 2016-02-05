package darkness_keys

import (
)



const (
  DARK_COUNTER = "dark:counter"
  DARK_EVENT   = "dark:event"
  DARK_RELAY   = "dark:relay"
)



/*
 * DARK_COUNTER:<label>
 */
func MkCounter (key string) string {
  return DARK_COUNTER + ":" + key
}



/*
 * DARK_EVENT
 */
func MkEvent () string {
  return DARK_EVENT
}



/*
 * DARK_RELAY
 */
func MkRelay() string {
  return DARK_RELAY
}
