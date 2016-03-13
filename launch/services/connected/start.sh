#!/bin/sh

# start irc connected daemon
(cd core/go/proto/irc/connected; make build; make run &)
