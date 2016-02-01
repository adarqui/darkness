package darkness_events

/*
 */
func (ae *AuthoredEvent) PatchId(id int64) {
  ae.Event.Id = id
}
